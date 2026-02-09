/**
 * Ambient module declaration for @testing-library/user-event.
 * Ensures TypeScript resolves the package when moduleResolution is "bundler".
 */
declare module "@testing-library/user-event" {
  interface UserEventInstance {
    click: (...args: unknown[]) => Promise<void>;
    type: (...args: unknown[]) => Promise<void>;
    clear: (...args: unknown[]) => Promise<void>;
    selectOptions: (...args: unknown[]) => Promise<void>;
    upload: (...args: unknown[]) => Promise<void>;
    tab: (...args: unknown[]) => Promise<void>;
    hover: (...args: unknown[]) => Promise<void>;
    unhover: (...args: unknown[]) => Promise<void>;
    [key: string]: (...args: unknown[]) => unknown;
  }
  const userEvent: UserEventInstance;
  export default userEvent;
  export { userEvent };
}
