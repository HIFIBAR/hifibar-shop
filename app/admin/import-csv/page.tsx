'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminGuard } from '@/components/admin-guard';
import { AdminLayout } from '@/components/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type ImportResult = {
  created: number;
  updated: number;
  errors: string[];
};

function ImportCSVContent() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string[][]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);

    const text = await selectedFile.text();
    const lines = text.split('\n').filter((line) => line.trim());
    const rows = lines.map((line) => {
      const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
      return matches ? matches.map((cell) => cell.replace(/^"|"$/g, '').trim()) : [];
    });

    setPreview(rows.slice(0, 6));
  }

  async function handleImport() {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter((line) => line.trim());
      const rows = lines.map((line) => {
        const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
        return matches ? matches.map((cell) => cell.replace(/^"|"$/g, '').trim()) : [];
      });

      const headers = rows[0];
      const dataRows = rows.slice(1);

      let created = 0;
      let updated = 0;
      const errors: string[] = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        if (row.length < headers.length) continue;

        try {
          const rowData: any = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index];
          });

          const compatModels = rowData.compat_tv_models
            ? rowData.compat_tv_models.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [];

          const productData = {
            ide: rowData.ide,
            code: rowData.code,
            type_carte: rowData.type_carte || '',
            marque_tv: rowData.marque_tv || '',
            modele_tv: rowData.modele_tv || '',
            num1: rowData.num1 || '',
            num2: rowData.num2 || '',
            compat_tv_models: compatModels,
            taille_tv: rowData.taille_tv || null,
            etat_piece: rowData.etat_piece || '1',
            etat_enregistrement: rowData.etat_enregistrement || 'P',
            source: rowData.source || null,
            prix: parseFloat(rowData.prix) || 0,
            poids_gr: parseInt(rowData.poids_gr) || 0,
            stock_qty: parseInt(rowData.stock_qty) || 0,
            est_visible: rowData.est_visible === 'true' || rowData.est_visible === '1',
            commentaire: rowData.commentaire || null,
            ebay_id: rowData.ebay_id || null,
          };

          const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('ide', productData.ide)
            .maybeSingle();

          if (existing) {
            const { error } = await supabase
              .from('products')
              .update(productData)
              .eq('id', existing.id);

            if (error) throw error;
            updated++;
          } else {
            const { error } = await supabase.from('products').insert(productData);
            if (error) throw error;
            created++;
          }
        } catch (error: any) {
          errors.push(`Ligne ${i + 2}: ${error.message}`);
        }
      }

      setResult({ created, updated, errors });

      toast({
        title: 'Import terminé',
        description: `${created} créés, ${updated} mis à jour, ${errors.length} erreurs`,
      });
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de l\'import',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Import CSV</h1>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Format attendu</h3>
              <p className="text-sm text-gray-600 mb-2">
                Le fichier CSV doit contenir les colonnes suivantes :
              </p>
              <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
                ide,code,type_carte,marque_tv,modele_tv,num1,num2,compat_tv_models,taille_tv,
                etat_piece,etat_enregistrement,source,prix,poids_gr,stock_qty,est_visible,
                commentaire,ebay_id
              </code>
              <p className="text-sm text-gray-600 mt-2">
                Si l'<strong>ide</strong> existe déjà, le produit sera mis à jour. Sinon, il sera créé.
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="font-semibold mb-2">
                  {file ? file.name : 'Choisir un fichier CSV'}
                </p>
                <p className="text-sm text-gray-500">
                  Cliquez pour sélectionner un fichier
                </p>
              </label>
            </div>

            {preview.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Aperçu (5 premières lignes)
                </h3>
                <div className="overflow-x-auto border rounded">
                  <table className="w-full text-xs">
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i} className={i === 0 ? 'bg-gray-100 font-semibold' : ''}>
                          {row.slice(0, 8).map((cell, j) => (
                            <td key={j} className="border p-2">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {file && (
              <div className="mt-6">
                <Button onClick={handleImport} disabled={loading} className="w-full">
                  {loading ? 'Import en cours...' : 'Importer les produits'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Résultats de l'import</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>
                    <strong>{result.created}</strong> produits créés
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span>
                    <strong>{result.updated}</strong> produits mis à jour
                  </span>
                </div>
                {result.errors.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span>
                        <strong>{result.errors.length}</strong> erreurs
                      </span>
                    </div>
                    <div className="ml-8 space-y-1">
                      {result.errors.slice(0, 10).map((error, i) => (
                        <p key={i} className="text-sm text-red-600">
                          {error}
                        </p>
                      ))}
                      {result.errors.length > 10 && (
                        <p className="text-sm text-gray-500">
                          ... et {result.errors.length - 10} autres erreurs
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

export default function ImportCSVPage() {
  return (
    <AdminGuard>
      <ImportCSVContent />
    </AdminGuard>
  );
}
