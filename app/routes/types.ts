/**
 * Utility type to remove the `matches` prop from a route component, since it's rarely used and it doesn't match the
 * type defined by `createRouteStub`'s Component.
 */
export type RouteComponentProps<T extends { matches: unknown }> = Omit<T, 'matches'>;
