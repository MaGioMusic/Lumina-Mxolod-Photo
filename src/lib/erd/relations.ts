/*
  ERD relations + validator for Lumina Estate.
  - Entities: minimal fields required for FK/relationship checks
  - Relationships: 1:1, 1:N, N:1, N:M (via join table)
  - Validators: entity/field presence, 1:1 uniqueness expectation, N:M via table integrity
  - Outputs: adjacency graph and Mermaid erDiagram string
*/

type Cardinality = '1:1' | '1:N' | 'N:1' | 'N:M';

interface Entity {
  name: string;
  fields: Record<string, string>;
  uniques?: string[]; // unique field or composite list (comma separated)
  primaryKey?: string; // defaults to 'id' if omitted
}

interface FieldRef {
  entity: string;
  field: string;
}

interface Relationship {
  name: string;
  cardinality: Cardinality;
  from: FieldRef; // FK side
  to: FieldRef;   // PK side
  via?: string;   // for N:M join table name
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
}

interface ValidationIssue {
  level: 'error' | 'warning';
  code: string;
  message: string;
  meta?: Record<string, unknown>;
}

interface ERDValidationResult {
  issues: ValidationIssue[];
  adjacency: Record<string, string[]>; // entity -> connected entities
  mermaid: string;
}

// Minimal entity set based on LUMINA_DATABASE_SCHEMA.md
const ENTITIES: Entity[] = [
  { name: 'users', fields: { id: 'uuid', email: 'string', role: 'enum' }, primaryKey: 'id' },
  { name: 'agents', fields: { id: 'uuid', user_id: 'uuid', license_number: 'string' }, uniques: ['user_id'], primaryKey: 'id' },
  { name: 'properties', fields: { id: 'uuid', agent_id: 'uuid', status: 'enum', price: 'decimal' }, primaryKey: 'id' },
  { name: 'favorites', fields: { id: 'uuid', user_id: 'uuid', property_id: 'uuid' }, uniques: ['user_id,property_id'], primaryKey: 'id' },
  { name: 'appointments', fields: { id: 'uuid', client_id: 'uuid', agent_id: 'uuid', property_id: 'uuid' }, primaryKey: 'id' },
  { name: 'reviews', fields: { id: 'uuid', author_id: 'uuid', agent_id: 'uuid', property_id: 'uuid' }, primaryKey: 'id' },
  { name: 'inquiries', fields: { id: 'uuid', user_id: 'uuid', agent_id: 'uuid', property_id: 'uuid' }, primaryKey: 'id' },
  { name: 'user_preferences', fields: { id: 'uuid', user_id: 'uuid', theme: 'enum' }, uniques: ['user_id'], primaryKey: 'id' },
  { name: 'transactions', fields: { id: 'uuid', property_id: 'uuid', buyer_id: 'uuid', seller_id: 'uuid', agent_id: 'uuid' }, primaryKey: 'id' },
  { name: 'property_analytics', fields: { id: 'uuid', property_id: 'uuid' }, primaryKey: 'id' },
  { name: 'notifications', fields: { id: 'uuid', user_id: 'uuid' }, primaryKey: 'id' },
  { name: 'mortgage_calculations', fields: { id: 'uuid', user_id: 'uuid', property_id: 'uuid' }, primaryKey: 'id' },
  { name: 'search_history', fields: { id: 'uuid', user_id: 'uuid' }, primaryKey: 'id' },
];

// Relationships among entities
const RELATIONSHIPS: Relationship[] = [
  // 1:1
  { name: 'users_has_agents', cardinality: '1:1', from: { entity: 'agents', field: 'user_id' }, to: { entity: 'users', field: 'id' } },
  { name: 'users_has_user_preferences', cardinality: '1:1', from: { entity: 'user_preferences', field: 'user_id' }, to: { entity: 'users', field: 'id' } },

  // 1:N
  { name: 'agents_to_properties', cardinality: '1:N', from: { entity: 'properties', field: 'agent_id' }, to: { entity: 'agents', field: 'id' } },
  { name: 'users_to_notifications', cardinality: '1:N', from: { entity: 'notifications', field: 'user_id' }, to: { entity: 'users', field: 'id' } },
  { name: 'properties_to_reviews', cardinality: '1:N', from: { entity: 'reviews', field: 'property_id' }, to: { entity: 'properties', field: 'id' } },
  { name: 'agents_to_reviews', cardinality: '1:N', from: { entity: 'reviews', field: 'agent_id' }, to: { entity: 'agents', field: 'id' } },
  { name: 'users_to_reviews', cardinality: '1:N', from: { entity: 'reviews', field: 'author_id' }, to: { entity: 'users', field: 'id' } },
  { name: 'properties_to_inquiries', cardinality: '1:N', from: { entity: 'inquiries', field: 'property_id' }, to: { entity: 'properties', field: 'id' } },
  { name: 'agents_to_inquiries', cardinality: '1:N', from: { entity: 'inquiries', field: 'agent_id' }, to: { entity: 'agents', field: 'id' } },
  { name: 'users_to_inquiries', cardinality: '1:N', from: { entity: 'inquiries', field: 'user_id' }, to: { entity: 'users', field: 'id' } },
  { name: 'properties_to_analytics', cardinality: '1:N', from: { entity: 'property_analytics', field: 'property_id' }, to: { entity: 'properties', field: 'id' } },

  // N:M via tables
  { name: 'users_favorite_properties', cardinality: 'N:M', from: { entity: 'favorites', field: 'user_id' }, to: { entity: 'users', field: 'id' }, via: 'favorites' },
  { name: 'properties_favorited_by_users', cardinality: 'N:M', from: { entity: 'favorites', field: 'property_id' }, to: { entity: 'properties', field: 'id' }, via: 'favorites' },
  { name: 'users_agents_appointments', cardinality: 'N:M', from: { entity: 'appointments', field: 'client_id' }, to: { entity: 'users', field: 'id' }, via: 'appointments' },
  { name: 'agents_users_appointments', cardinality: 'N:M', from: { entity: 'appointments', field: 'agent_id' }, to: { entity: 'agents', field: 'id' }, via: 'appointments' },

  // Transactions participants
  { name: 'transactions_property', cardinality: 'N:1', from: { entity: 'transactions', field: 'property_id' }, to: { entity: 'properties', field: 'id' } },
  { name: 'transactions_buyer', cardinality: 'N:1', from: { entity: 'transactions', field: 'buyer_id' }, to: { entity: 'users', field: 'id' } },
  { name: 'transactions_seller', cardinality: 'N:1', from: { entity: 'transactions', field: 'seller_id' }, to: { entity: 'users', field: 'id' } },
  { name: 'transactions_agent', cardinality: 'N:1', from: { entity: 'transactions', field: 'agent_id' }, to: { entity: 'agents', field: 'id' } },
];

// --- Implementation ---
function entityMap(entities: Entity[]): Record<string, Entity> {
  return entities.reduce<Record<string, Entity>>((acc, e) => {
    acc[e.name] = e;
    return acc;
  }, {});
}

export function validateERD(entities: Entity[] = ENTITIES, relations: Relationship[] = RELATIONSHIPS): ERDValidationResult {
  const issues: ValidationIssue[] = [];
  const map = entityMap(entities);

  const ensureEntityField = (ref: FieldRef, ctx: string) => {
    const ent = map[ref.entity];
    if (!ent) {
      issues.push({ level: 'error', code: 'ENTITY_MISSING', message: `Missing entity '${ref.entity}' for ${ctx}` });
      return;
    }
    if (!ent.fields[ref.field]) {
      issues.push({ level: 'error', code: 'FIELD_MISSING', message: `Missing field '${ref.entity}.${ref.field}' for ${ctx}` });
    }
  };

  for (const r of relations) {
    ensureEntityField(r.from, r.name);
    ensureEntityField(r.to, r.name);

    if (r.cardinality === '1:1') {
      const ent = map[r.from.entity];
      const isUnique = !!ent?.uniques?.some(u => u.split(',').map(s => s.trim()).includes(r.from.field));
      if (!isUnique) {
        issues.push({ level: 'warning', code: 'ONE_TO_ONE_NOT_UNIQUE', message: `1:1 '${r.name}' expects '${r.from.entity}.${r.from.field}' to be UNIQUE` });
      }
    }

    if (r.cardinality === 'N:M') {
      if (!r.via) {
        issues.push({ level: 'error', code: 'NM_MISSING_VIA', message: `N:M '${r.name}' requires 'via' join table` });
      } else {
        const jt = map[r.via];
        if (!jt) {
          issues.push({ level: 'error', code: 'VIA_TABLE_MISSING', message: `Join table '${r.via}' for '${r.name}' not found` });
        } else if (!jt.fields[r.from.field]) {
          issues.push({ level: 'error', code: 'VIA_FIELD_MISSING', message: `Join table '${r.via}' missing field '${r.from.field}' for '${r.name}'` });
        }
      }
    }
  }

  // adjacency graph
  const adjacency: Record<string, string[]> = {};
  for (const e of entities) adjacency[e.name] = [];
  const pushEdge = (a: string, b: string) => {
    if (!adjacency[a].includes(b)) adjacency[a].push(b);
  };
  for (const r of relations) {
    pushEdge(r.from.entity, r.to.entity);
    pushEdge(r.to.entity, r.from.entity);
  }

  const mermaid = toMermaid(entities, relations);
  return { issues, adjacency, mermaid };
}

export function toMermaid(entities: Entity[] = ENTITIES, relations: Relationship[] = RELATIONSHIPS): string {
  const lines: string[] = ['erDiagram'];
  for (const e of entities) {
    lines.push(`  ${e.name} {`);
    for (const [f, t] of Object.entries(e.fields)) {
      lines.push(`    ${t} ${f}`);
    }
    lines.push('  }');
  }
  for (const r of relations) {
    const card = (c: Cardinality) => (c === '1:1' ? '||--||' : c === '1:N' ? '||--o{' : c === 'N:1' ? '}o--||' : '}o--o{');
    lines.push(`  ${r.to.entity} ${card(r.cardinality)} ${r.from.entity} : "${r.name}${r.via ? ` (via ${r.via})` : ''}"`);
  }
  return lines.join('\n');
}

// Dev helper to run quick check from code
function runERDCheck(): void {
  const { issues, adjacency, mermaid } = validateERD();
  console.table(issues);
  console.log('Adjacency:', adjacency);
  console.log('Mermaid ERD:\n' + mermaid);
}
;


