import type { Profile } from "types/profile";

/**
 * Constructs the formatted full name from a Profile or Player object.
 * @param {Profile["name"]} name - The name object containing firstName and lastName properties.
 * @returns {string} The formatted full name as "firstName lastName".
 */
const getFormattedName = (name: Profile["name"]): string => {
  return `${name.firstName} ${name.lastName}`;
};

export default getFormattedName;
