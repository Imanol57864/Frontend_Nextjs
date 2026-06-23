import Link from "next/link";

export default function BackToDashboard({ id = "returnHome", label = "Regresar al análisis" }) {
  return (
    <Link id={id} href="/main_catalog" className="btn-primary">
      {label}
    </Link>
  );
}
