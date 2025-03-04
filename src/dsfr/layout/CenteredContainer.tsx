import { Container, type ContainerProps } from "./Container";
import { Grid, GridCol } from "./Grid";

export type CenteredContainerProps = ContainerProps & {
  /**
   * For internal Grid
   */
  haveGutters?: boolean;
};
export const CenteredContainer = ({ children, haveGutters, ...rest }: CenteredContainerProps) => (
  <Container {...rest}>
    <Grid haveGutters={haveGutters} align="center">
      <GridCol md={10} lg={8}>
        {children}
      </GridCol>
    </Grid>
  </Container>
);
