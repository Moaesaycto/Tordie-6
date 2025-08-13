/*
This helper file contains general usage for the object-structured scene rendering.
*/

export type Id = string;
let _id = 0;
export const genId = (p = "id"): Id => `${p}_${Date.now().toString(36)}_${(_id++).toString(36)}`;
