import Image from "next/image";
import { parts } from "../Data/parts";

export default function ProduitsPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Pièces TV disponibles</h1>

      {parts.length === 0 ? (
        <p>Aucune pièce pour le moment.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {parts.map((p) => (
            <article
              key={p.code}
              className="border rounded-lg shadow-sm p-4 flex flex-col bg-white"
            >
              {/* Image principale */}
              {p.images && p.images[0] && (
                <div className="relative w-full aspect-[4/3] mb-3">
                  <Image
                    src={p.images[0]}
                    alt={p.title}
                    fill
                    className="object-contain rounded"
                  />
                </div>
              )}

              {/* Titre avec le symbole ✅ (HTML) */}
              <h2
                className="font-semibold text-lg mb-1"
                dangerouslySetInnerHTML={{ __html: p.title }}
              />

              {/* Petite description */}
              <p className="text-sm text-gray-600 mb-2">
                {p.shortDescription}
              </p>

              {/* Prix */}
              <p className="font-bold text-xl mb-3">
                {p.price.toFixed(2)} €
              </p>

              {/* Infos techniques */}
              <div className="mt-auto text-xs text-gray-500">
                <div>Code interne : {p.code}</div>
                <div>
                  TV : {p.brand} {p.tvModel}
                </div>
                <div>
                  Réf. carte : {p.num1}
                  {p.num2 ? " / " + p.num2 : ""}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
