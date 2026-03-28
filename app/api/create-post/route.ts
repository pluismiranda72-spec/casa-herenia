/**
 * Alias de creación de posts: misma lógica que POST /api/publish.
 * El cliente puede usar /api/create-post o /api/publish indistintamente.
 */
export { runtime } from "../publish/route";
export { POST } from "../publish/route";
