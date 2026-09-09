export function displayName(author: {
  firstName: string;
  middleName?: string | null;
  lastName: string;
}) {
  return [author.firstName, author.middleName, author.lastName].filter(Boolean).join(" ");
}
