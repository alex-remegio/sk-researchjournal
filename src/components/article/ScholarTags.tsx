import { generateScholarTags, type ScholarArticle } from "@/lib/scholar";

export function ScholarTags({ article }: { article: ScholarArticle }) {
  return (
    <>
      {generateScholarTags(article).map((tag, index) => (
        <meta key={`${tag.name}-${index}`} name={tag.name} content={tag.content} />
      ))}
    </>
  );
}
