export {};

declare global {
  interface Window {
    Termly?: {
      initialize: () => void;
      // Add other Termly methods or properties here as needed
    };
  }
}
