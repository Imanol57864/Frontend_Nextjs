import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { queryLabsNames, queryStaticInfo } from "@/lib/catalog";
import PageChrome from "@/components/PageChrome";
import LoadScreen from "@/components/LoadScreen";
import ConfirmPopup from "@/components/ConfirmPopup";
import EditDescPopup from "@/components/EditDescPopup";
import CatalogAgGrid from "@/components/LazyCatalogAgGrid";
import { Panel, PanelBody, PanelToolbar } from "@/components/Panel";

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
          <PanelBody>
            <PanelToolbar columns="panel-grid-catalog" className="hero-toolbar">
              <div className="panel-control">
                <div className="searchable-dropdown">
                  <span className="toolbar-label">Laboratorio</span>
                  <input type="text" id="labSearchInput" placeholder="Escribe o selecciona un laboratorio" autoComplete="off" />
                  <div id="labOptionsList" className="options-list hide">
                    {labsNames.map((item) => (
                      <div className="option-item" data-labname={item.nombre_lab} key={item.nombre_lab}>
                        <strong>{item.nombre_lab}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Link id="getLabView_btn" href="/main_catalog/laboratories" className="btn-primary">
                Gestionar Laboratorios
              </Link>
            </PanelToolbar>

            <PanelToolbar columns="panel-grid-info">
              <div className="panel-control panel-control-main">
                <div id="lab-title" className="lab-title">[...]</div>
                <div id="lab-country" className="lab-country">[...]</div>
                <div className="lab-info">
                  <span id="lab-info-location">[...]</span>
                  <br />
                  <span id="lab-info-contact">[...]</span>
                </div>
              </div>
              <div className="panel-control">
                <div className="metric currency-metric">
                  <p id="lab-divisa">[...]</p>
                </div>
              </div>
              <div className="panel-control">
                <div className="metric-grid">
                  {staticInfo.map((item) => (
                    <div className="metric" id={`estatico_${item.id}`} key={item.id}>
                      <h4>{item.marker}</h4>
                      <p>$ {Number(item.value || 0).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </PanelToolbar>
          </PanelBody>

          <PanelBody className="table-panel">
            <PanelToolbar id="bottomTables" columns="panel-grid-table-actions" className="hide">
              <div className="toolbar-field">
                <input className="search_at_table" id="search" placeholder="Buscar..." />
              </div>
              <button id="download-pdf" className="btn-primary">PDF</button>
              <div className="currency-actions">
                <button id="btn_changeto_mxn" className="btn-secondary">MXN</button>
                <button id="btn_changeto_usd" className="btn-secondary">USD</button>
                <button id="btn_changeto_eur" className="btn-secondary">EUR</button>
              </div>
            </PanelToolbar>
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
