export type Meta = { origin: string; confidence: number | null; reason: string | null };

export type Column = {
  id: string; name: string; logical_type: string; original_type: string | null;
  nullable: boolean; semantic_role: string;
};

export type Table = {
  id: string; name: string; role: "fact" | "dimension" | "bridge" | "unknown";
  role_meta: Meta; primary_key: string[]; columns: Column[];
};

export type Relationship = {
  id: string; from_table: string; to_table: string;
  from_columns: string[]; to_columns: string[]; cardinality: string;
};

export type SchemaIR = {
  ir_version: string; name: string; kind: string; tables: Table[]; relationships: Relationship[];
};

export type ProjectOut = { id: number; name: string; created_at: string };
export type ProjectDetail = ProjectOut & { ir: SchemaIR };
export type VersionOut = { number: number; note: string; created_at: string };
