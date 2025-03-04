import "server-only";

import { forbidden } from "next/navigation";
import { type Session } from "next-auth";

import { type Group, groupRuleValidations } from "../model/Group";
import { auth } from "../next-auth/auth";
import { getServerService } from "../services";
import { UnexpectedSessionError } from "./error";

type AssertParam<T> = T | { check: T; message?: string };
type AssertSessionParams = {
  admin?: AssertParam<boolean>;
  groupMember?: AssertParam<Group>;
  groupOwner?: AssertParam<Group>;
  message?: string;
  startupMember?: AssertParam<string>;
};

const defaultMessage = "Session non trouvée.";

/**
 * Assert that the current session is present and that the user is either owner of the document or admin.
 */
export const assertServerSession = async ({
  admin,
  message = defaultMessage,
  groupOwner,
  groupMember,
  startupMember,
}: AssertSessionParams = {}): Promise<Session> => {
  const session = await auth();
  if (!session?.user) {
    throw new UnexpectedSessionError(message);
  }

  const espaceMembreService = await getServerService("espaceMembre");

  const shouldCheckStaff = typeof admin === "boolean" ? admin : admin?.check;
  const shouldCheckGroupOwner = groupOwner && "check" in groupOwner ? groupOwner?.check : groupOwner;
  const shouldCheckGroupMember = groupMember && "check" in groupMember ? groupMember?.check : groupMember;
  const shouldCheckStartupMember = typeof startupMember === "string" ? startupMember : startupMember?.check;

  const member = await espaceMembreService.getMemberByUsername(session.user.username);
  const { isOwner: isGroupOwner } = shouldCheckGroupOwner
    ? await espaceMembreService.getMemberMembership(member, groupOwner as Group)
    : { isOwner: false };
  const { isMember: isGroupMember } = shouldCheckGroupMember
    ? await espaceMembreService.getMemberMembership(member, groupMember as Group)
    : { isMember: false };
  const isStartupMember = shouldCheckStartupMember
    ? groupRuleValidations.startup(member, shouldCheckStartupMember)
    : false;

  if (shouldCheckGroupOwner && shouldCheckStaff) {
    if (!(isGroupOwner || session.user.isAdmin)) {
      forbidden();
    }
  } else if (shouldCheckGroupOwner) {
    if (!isGroupOwner) {
      forbidden();
    }
  } else if (shouldCheckGroupMember && shouldCheckStaff) {
    if (!(isGroupMember || session.user.isAdmin)) {
      forbidden();
    }
  } else if (shouldCheckGroupMember) {
    if (!isGroupMember) {
      forbidden();
    }
  } else if (shouldCheckStartupMember && shouldCheckStaff) {
    if (!(isStartupMember || session.user.isAdmin)) {
      forbidden();
    }
  } else if (shouldCheckStartupMember) {
    if (!isStartupMember) {
      forbidden();
    }
  } else if (shouldCheckStaff) {
    if (!session.user.isAdmin) {
      forbidden();
    }
  }

  return session;
};
