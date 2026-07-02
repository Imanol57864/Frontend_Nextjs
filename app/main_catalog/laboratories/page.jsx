import { requirePageUser } from "@/lib/auth";
import PageChrome from "@/components/PageChrome";
import LoadScreen from "@/components/LoadScreen";
import ConfirmPopup from "@/components/ConfirmPopup";
import LaboratoriesAgGrid from "@/components/LazyLaboratoriesAgGrid";
import BackToDashboard from "@/components/BackToDashboard";
import { Panel, PanelToolbar } from "@/components/Panel";
import { canUseIam } from "@/lib/iam";
import { notFound } from "next/navigation";

export const metadata = {
  title: "IFC | Laboratorios"
};

export default async function LaboratoriesPage() {
  const { user, areaId } = await requirePageUser();
  if (!canUseIam("labs", "access_view", areaId)) notFound();
  const canViewAnalisis = canUseIam("analisis", "access_view", areaId);
  const canCreateUpdateLabs = canUseIam("labs", "create_update_actions", areaId);

  return (
    <>
      <PageChrome userEmail={user.email ?? "[...]"} areaId={areaId}>
        <Panel id="bottomTables">
          <PanelToolbar columns="panel-grid-3">
            <div className="panel-control">
              <input className="search_at_table" id="search" placeholder="Buscar..." />
            </div>
            {canCreateUpdateLabs && <button id="add-lab" className="btn-primary">A&ntilde;adir laboratorio</button>}
            {canViewAnalisis && <BackToDashboard label="Tablero análisis" />}
          </PanelToolbar>
          <div className="table-wrap">
            <LaboratoriesAgGrid />
          </div>
        </Panel>
      </PageChrome>
      <LoadScreen />
      <ConfirmPopup />
    </>
  );
}
