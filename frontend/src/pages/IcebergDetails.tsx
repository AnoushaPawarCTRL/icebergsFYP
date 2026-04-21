import { useParams } from "react-router-dom";

export default function IcebergDetails() {
  const { id } = useParams<{ id: string }>();

  return <h1>Iceberg Details for ID: {id}</h1>;
}