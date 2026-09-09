import { prisma } from "@/lib/db";
import { SimpleCreateForm } from "@/components/admin/SimpleCreateForm";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    include: { journal: true },
    orderBy: { name: "asc" },
  });
  const journals = await prisma.journal.findMany({ where: { deletedAt: null }, select: { id: true, name: true } });
  return (
    <div>
      <h1 className="font-serif text-3xl">Categories</h1>
      <ul className="mt-6 divide-y rounded border bg-white">
        {categories.map((category) => (
          <li key={category.id} className="p-4">
            {category.journal.abbreviation}: {category.name}
          </li>
        ))}
      </ul>
      <SimpleCreateForm
        endpoint="/api/categories"
        fields={[
          { name: "journalId", label: "Journal ID", placeholder: journals[0]?.id ?? "" },
          { name: "name", label: "Name" },
        ]}
      />
    </div>
  );
}
