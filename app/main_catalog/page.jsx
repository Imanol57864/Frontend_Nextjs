import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { queryLabsNames, queryStaticInfo } from "@/lib/catalog";
import PageChrome from "@/components/PageChrome";
import LoadScreen from "@/components/LoadScreen";
import ConfirmPopup from "@/components/ConfirmPopup";
import EditDescPopup from "@/components/EditDescPopup";
import CatalogAgGrid from "@/components/LazyCatalogAgGrid";
import { Panel, PanelBody } from "@/components/Panel";

export const metadata = {
  title: "IFC | Análisis"
};

export default async function CatalogPage() {
  const { supabase, user } = await requirePageUser();
  const [labsNames, staticInfo] = await Promise.all([
    queryLabsNames(supabase),
    queryStaticInfo(supabase)
  ]);

  return (
    <>
      <PageChrome userEmail={user.email ?? "[...]"}>
        <Panel>
          <PanelBody className="catalog-sticky-toolbar">
            <div className="catalog-topbar">
              <Link id="getLabView_btn" href="/main_catalog/laboratories" className="btn-primary catalog-primary-action">
                Tablero Laboratorios
              </Link>

              <div className="toolbar-field catalog-search">
                <input className="search_at_table" id="search" placeholder="Búsqueda universal de cualquier palabra" />
              </div>

              <div className="catalog-command-cluster">
                <button id="download-pdf" className="btn-primary">PDF</button>
                <div className="currency-actions">
                  <button id="btn_changeto_mxn" className="btn-secondary">MXN</button>
                  <button id="btn_changeto_usd" className="btn-secondary">USD</button>
                  <button id="btn_changeto_eur" className="btn-secondary">EUR</button>
                </div>
              </div>

              <div className="catalog-rate-strip">
                {staticInfo.map((item) => (
                  <div className="metric" id={`estatico_${item.id}`} key={item.id}>
                    <h4>{item.marker}</h4>
                    <p>$ {Number(item.value || 0).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </PanelBody>

          <PanelBody className="table-panel">
            <div className="table-wrap">
              <CatalogAgGrid />
            </div>
          </PanelBody>
        </Panel>
      </PageChrome>
      <LoadScreen />
      <ConfirmPopup />
      <EditDescPopup />
    </>
  );
}
