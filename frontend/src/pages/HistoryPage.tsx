import { useParams } from "react-router-dom";

export function HistoryPage() {
  const { id } = useParams<{ id: string }>();
  return <h1>History Page for Iceberg {id}</h1>;
}
