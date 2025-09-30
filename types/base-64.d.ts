// Ambient type declarations for the 'base-64' package.
// The library ships without TypeScript types, so importing with
//   import { encode, decode } from 'base-64';
// may trigger: "Could not find a declaration file for module 'base-64'".
// This file supplies minimal typings used in the project.
//
// If you later install official types (unlikely) or switch libraries,
// you can remove this file.

declare module 'base-64' {
  /** Encode a UTF-8/ASCII string into a base64 string */
  export function encode(input: string): string;
  /** Decode a base64 string into an (ASCII) string */
  export function decode(input: string): string;
}
