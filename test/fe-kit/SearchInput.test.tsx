describe('<SearchInput />', () => {
  beforeEach(() => {
    // Make all timeouts be still async, but resolve immediately
    vi.stubGlobal('setTimeout', (callback: () => unknown) => setTimeout(callback, 0));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
});
