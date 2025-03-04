import {
  EspaceMembreClient,
  type IncubatorWithMembers,
  type IncubatorWithStartups,
  type Member,
  type StartupWithIncubator,
} from "@incubateur-ademe/next-auth-espace-membre-provider/EspaceMembreClient";

import { config } from "@/config";
import { getGroupMembership, type Group, type GroupMembership } from "@/lib/model/Group";

import { type Service } from "../types";

export class EspaceMembreService implements Service {
  private readonly client = new EspaceMembreClient({
    apiKey: config.espaceMembre.apiKey,
    endpointUrl: config.espaceMembre.url,
    fetchOptions: {
      next: {
        revalidate: 3600,
      },
    },
  });

  public init(): void {
    // Nothing to do
  }

  public getMemberByUsername(username: string): Promise<Member> {
    return this.client.member.getByUsername(username);
  }

  public getMemberMembership(username: string, group: Group): Promise<GroupMembership>;
  public getMemberMembership(member: Member, group: Group): Promise<GroupMembership>;
  public async getMemberMembership(memberOrUsername: Member | string, group: Group): Promise<GroupMembership> {
    const member =
      typeof memberOrUsername === "string"
        ? await this.client.member.getByUsername(memberOrUsername)
        : memberOrUsername;

    return getGroupMembership(member, group);
  }

  public async getIncubatorsWithMembers(): Promise<IncubatorWithMembers[]> {
    return this.client.incubator.getAll({
      withMembers: true,
    });
  }

  public async getIncubatorsWithStartups(): Promise<IncubatorWithStartups[]> {
    return this.client.incubator.getAll(
      {
        withStartups: true,
      },
      {
        cache: "no-store",
        next: {
          revalidate: 0,
        },
      },
    );
  }

  public async getStartupByGhid(ghid: string): Promise<StartupWithIncubator> {
    return this.client.startup.getByGhid(ghid);
  }
}
