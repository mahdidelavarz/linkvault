"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  type Infrastructure,
  type CreateInfraDto,
  INFRA_TYPES,
  type InfraType,
} from "@/types/infrastructure";
import {
  useCreateInfrastructure,
  useUpdateInfrastructure,
} from "@/hooks/useInfrastructure";
import { useCategories } from "@/hooks/useCategories";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FormLayout from "@/components/layout/FormLayout";
import Alert from "@/components/ui/Alert";
import TagSelector from "@/components/tags/TagSelector";
import {
  LucideCheck,
  LucideCircleAlert,
  LucideContainer,
  LucideDatabase,
  LucideFolder,
  LucideGlobe,
  LucideKeyRound,
  LucideLayers,
  LucideLock,
  LucideNetwork,
  LucideRocket,
  LucideServer,
  LucideSettings,
  LucideShield,
  LucideStar,
  LucideType,
  LucideUser,
} from "@/Icons/Icons";
import Textarea from "../ui/TextArea";
import FormSelect from "../snippets/FormSelect";

// ─── Iconify icons per type ───────────────────────────────────────────────────
const INFRA_ICONS = {
  env: LucideKeyRound,
  server: LucideServer,
  docker: LucideContainer,
  deployment: LucideRocket,
  database: LucideDatabase,
  network: LucideNetwork,
} as const;
type InfraIconKey = keyof typeof INFRA_ICONS;

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  infraType: z.string().min(1),
  content: z.string().min(1, "Content is required"),
  description: z.string().max(1000).optional(),
  isFavorite: z.boolean(),
  categoryId: z.number().optional(),
  tagIds: z.array(z.number()),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
type FormData = z.infer<typeof schema>;

// ─── Content placeholders per type ───────────────────────────────────────────
const PLACEHOLDERS: Record<string, string> = {
  env: "DATABASE_URL=postgresql://localhost:5432/mydb\nAPI_KEY=your-api-key\nNODE_ENV=production\nPORT=3000",
  server: "ssh user@192.168.1.100 -p 22\n# Additional connection notes here",
  docker:
    'version: "3.8"\nservices:\n  app:\n    image: myapp:latest\n    ports:\n      - "3000:3000"\n    environment:\n      - NODE_ENV=production',
  deployment:
    "# Deployment steps\n1. Build: npm run build\n2. Push: docker push myapp:latest\n3. Deploy: kubectl apply -f k8s/",
  database:
    "host: localhost\nport: 5432\ndatabase: mydb\nuser: admin\n# Connection string: postgresql://admin@localhost:5432/mydb",
  network:
    "# Network configuration\nsubnet: 10.0.0.0/24\ngateway: 10.0.0.1\ndns: 8.8.8.8, 8.8.4.4",
};

const CONTENT_LABELS: Record<string, string> = {
  env: "Environment Variables",
  server: "Connection / Notes",
  docker: "Docker Configuration",
  deployment: "Deployment Notes",
  database: "Database Config",
  network: "Network Config",
};

// ─── Component ────────────────────────────────────────────────────────────────
interface InfraFormProps {
  item?: Infrastructure | null;
  onClose: () => void;
}

export default function InfraForm({ item, onClose }: InfraFormProps) {
  const isEditing = !!item;
  const { data: categories } = useCategories();
  const createItem = useCreateInfrastructure();
  const updateItem = useUpdateInfrastructure();
  const isLoading = createItem.isPending || updateItem.isPending;
  const error = createItem.error || updateItem.error;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      infraType: "env",
      content: "",
      description: "",
      isFavorite: false,
      categoryId: undefined,
      tagIds: [],
      metadata: {},
    },
  });

  const watchedType = watch("infraType") as InfraType;

  useEffect(() => {
    if (item) {
      reset({
        title: item.title,
        infraType: item.infraType,
        content: item.content,
        description: item.description ?? "",
        isFavorite: item.isFavorite,
        categoryId: item.categoryId,
        tagIds: item.tags?.map((t: any) => t.id) ?? [],
        metadata: (item.metadata ?? {}) as Record<string, unknown>, // Fixed: proper type assertion syntax
      });
    }
  }, [item, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload: CreateInfraDto = {
        ...data,
        infraType: data.infraType as InfraType, // Fixed: ensure infraType is typed correctly
        description: data.description || undefined,
      };
      if (isEditing && item) {
        await updateItem.mutateAsync({ id: item.id, ...payload });
      } else {
        await createItem.mutateAsync(payload);
      }
      onClose();
    } catch {
      /* shown via Alert */
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <FormLayout
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        footer={
          <>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>
              {isEditing ? "Save changes" : "Create config"}
            </Button>
          </>
        }
      >
        <div className="iform-content">
        {error && (
          <Alert
            type="error"
            message={
              error instanceof Error ? error.message : "Something went wrong"
            }
          />
        )}

        {/* ── Type selector ── */}
        <div className="iform-field">
          <label className="iform-label">Type</label>
          <Controller
            name="infraType"
            control={control}
            render={({ field }) => (
              <div className="iform-type-grid">
                {Object.entries(INFRA_TYPES).map(([key, { label }]) => (
                  <button
                    key={key}
                    type="button"
                    className={[
                      "iform-type-btn",
                      field.value === key ? "iform-type-btn--active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => field.onChange(key)}
                  >
                    {(() => {
                      const Icon = INFRA_ICONS[key as InfraIconKey];
                      return Icon ? (
                        <Icon width={13} />
                      ) : (
                        <LucideSettings width={13} />
                      );
                    })()}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        {/* ── Title ── */}
        <Input
          label="Title"
          type="text"
          placeholder={
            watchedType === "env"
              ? "e.g., Production ENV"
              : watchedType === "server"
                ? "e.g., App Server — EU West"
                : watchedType === "docker"
                  ? "e.g., API Compose"
                  : "Configuration title"
          }
          leftIcon={LucideType}
          error={errors.title?.message}
          autoFocus
          {...register("title")}
        />

        {/* ── Type-specific metadata ── */}
        <TypeMetadata
          type={watchedType}
          register={register}
          control={control}
        />

        {/* ── Description ── */}
        <Textarea
          label="Description"
          placeholder="What is this config for? Any important notes?"
          optional
          rows={2}
          error={errors.description?.message}
          {...register("description")}
        />

        {/* ── Content ── */}
        <div className="iform-field">
          <div className="iform-content-header">
            <label className="iform-label">
              {CONTENT_LABELS[watchedType] ?? "Content"}
            </label>
            {watchedType === "env" && (
              <span className="iform-env-hint">
                <LucideShield width={11} />
                Values are masked when viewing
              </span>
            )}
          </div>
          <div
            className={[
              "iform-code-wrap",
              errors.content ? "iform-code-wrap--error" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <textarea
              className="iform-code"
              placeholder={PLACEHOLDERS[watchedType] ?? "Enter configuration…"}
              rows={10}
              spellCheck={false}
              {...register("content")}
            />
          </div>
          {errors.content && (
            <p className="iform-field-error">
              <LucideCircleAlert width={12} />
              {errors.content.message}
            </p>
          )}
        </div>

        {/* ── Organize ── */}
        <div className="iform-organize">
          <FormSelect
            label="Category"
            optional
            leftIcon={LucideFolder}
            {...register("categoryId", {
              setValueAs: (v) => (v ? parseInt(v) : undefined),
            })}
          >
            <option value="">No category</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </FormSelect>

          <div className="iform-field">
            <label className="iform-label">
              Tags <span className="iform-optional">optional</span>
            </label>
            <Controller
              name="tagIds"
              control={control}
              render={({ field }) => (
                <TagSelector
                  selectedTagIds={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        {/* ── Favorite ── */}
        <Controller
          name="isFavorite"
          control={control}
          render={({ field }) => (
            <label className="iform-checkbox">
              <div
                className={["iform-check", field.value ? "iform-check--on" : ""]
                  .filter(Boolean)
                  .join(" ")}
              >
                {field.value && <LucideCheck width={11} />}
              </div>
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                style={{
                  position: "absolute",
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />
              <span className="iform-check-label">
                <LucideStar width={13} style={{ color: "#fbbf24" }} />
                Mark as favorite
              </span>
            </label>
          )}
        />

        </div>

      </FormLayout>
    </>
  );
}

// ─── Type-specific metadata fields ───────────────────────────────────────────

function TypeMetadata({
  type,
  register,
  control,
}: {
  type: InfraType;
  register: any;
  control: any;
}) {
  if (type === "server")
    return (
      <div className="iform-meta-box">
        <p className="iform-meta-title">
          <LucideServer width={12} />
          Server details
        </p>
        <div className="iform-grid-3">
          <Input
            label="Host / IP"
            placeholder="192.168.1.100"
            leftIcon={LucideGlobe}
            optional
            {...register("metadata.host")}
          />
          <Input
            label="Port"
            placeholder="22"
            type="number"
            optional
            {...register("metadata.port")}
          />
          <Input
            label="Username"
            placeholder="root"
            leftIcon={LucideUser}
            optional
            {...register("metadata.username")}
          />
        </div>
        <FormSelect
          label="Auth type"
          leftIcon={LucideLock}
          optional
          {...register("metadata.authType")}
        >
          <option value="password">Password</option>
          <option value="key">SSH Key</option>
          <option value="key-passphrase">SSH Key + Passphrase</option>
        </FormSelect>
      </div>
    );

  if (type === "env")
    return (
      <FormSelect
        label="Environment"
        leftIcon={LucideLayers}
        optional
        {...register("metadata.environment")}
      >
        <option value="">Any environment</option>
        <option value="development">Development</option>
        <option value="staging">Staging</option>
        <option value="production">Production</option>
        <option value="testing">Testing</option>
      </FormSelect>
    );

  if (type === "config")
    return (
      <div className="iform-meta-box">
        <p className="iform-meta-title">
          <LucideDatabase width={12} />
          Database details
        </p>
        <div className="iform-grid-2">
          <FormSelect
            label="Engine"
            leftIcon={LucideDatabase}
            optional
            {...register("metadata.engine")}
          >
            <option value="">Any</option>
            {["PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "MSSQL"].map(
              (e) => (
                <option key={e} value={e.toLowerCase()}>
                  {e}
                </option>
              ),
            )}
          </FormSelect>
          <Input
            label="Host"
            placeholder="localhost"
            optional
            {...register("metadata.host")}
          />
        </div>
        <div className="iform-grid-2">
          <Input
            label="Port"
            placeholder="5432"
            type="number"
            optional
            {...register("metadata.port")}
          />
          <Input
            label="Database name"
            placeholder="mydb"
            optional
            {...register("metadata.database")}
          />
        </div>
      </div>
    );

  if (type === "docker")
    return (
      <FormSelect
        label="Compose version"
        leftIcon={LucideContainer}
        optional
        {...register("metadata.composeVersion")}
      >
        <option value="">Any</option>
        {["3.8", "3.7", "3", "2.4", "2"].map((v) => (
          <option key={v} value={v}>
            v{v}
          </option>
        ))}
      </FormSelect>
    );

  if (type === "deployment")
    return (
      <FormSelect
        label="Platform"
        leftIcon={LucideRocket}
        optional
        {...register("metadata.platform")}
      >
        <option value="">Any</option>
        {[
          "Kubernetes",
          "Docker Swarm",
          "AWS ECS",
          "Vercel",
          "Railway",
          "Heroku",
          "Render",
          "VPS",
        ].map((p) => (
          <option key={p} value={p.toLowerCase()}>
            {p}
          </option>
        ))}
      </FormSelect>
    );

  return null;
}

const CSS = `
.iform-content { display: flex; flex-direction: column; gap: 16px; padding: 8px 0; }

/* Type grid */
.iform-field { display: flex; flex-direction: column; gap: 6px; }
.iform-label { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
.iform-optional { font-size: var(--text-xs); font-weight: 400; color: var(--text-tertiary); }

.iform-type-grid {
  display:   grid;
  grid-template-columns: repeat(3, 1fr);
  gap:       8px;
}
@media (min-width: 480px) { .iform-type-grid { grid-template-columns: repeat(6, 1fr); } }

.iform-type-btn {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  justify-content: center;
  gap:            5px;
  padding:        10px 6px;
  background:     var(--bg-elevated);
  border:         1px solid var(--border-default);
  border-radius:  var(--radius-md);
  color:          var(--text-secondary);
  font-size:      var(--text-xs);
  font-family:    var(--font-sans);
  font-weight:    500;
  cursor:         pointer;
  min-height:     64px;
  transition:     background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast);
}
.iform-type-btn:hover {
  background:   var(--bg-overlay);
  border-color: var(--border-strong);
  color:        var(--text-primary);
}
.iform-type-btn--active {
  background:   var(--accent-muted);
  border-color: var(--border-focus);
  color:        var(--cyan-300);
  box-shadow:   0 0 0 1px var(--border-focus);
}
.iform-type-icon { width: 18px; height: 18px; flex-shrink: 0; }

/* Metadata box */
.iform-meta-box {
  display:        flex;
  flex-direction: column;
  gap:            12px;
  padding:        14px;
  background:     var(--bg-elevated);
  border:         1px solid var(--border-subtle);
  border-radius:  var(--radius-md);
}
.iform-meta-title {
  display:     flex;
  align-items: center;
  gap:         6px;
  font-size:   var(--text-xs);
  font-weight: 600;
  color:       var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.iform-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.iform-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
@media (max-width: 479px) {
  .iform-grid-2,
  .iform-grid-3 { grid-template-columns: 1fr; }
}

/* Content */
.iform-content-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.iform-env-hint {
  display: flex; align-items: center; gap: 4px;
  font-size: var(--text-xs); color: var(--text-tertiary);
}
.iform-code-wrap {
  border:        1px solid var(--border-default);
  border-radius: var(--radius-md);
  overflow:      hidden;
  transition:    border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.iform-code-wrap:focus-within {
  border-color: var(--border-focus);
  box-shadow:   0 0 0 3px var(--accent-muted);
}
.iform-code-wrap--error { border-color: var(--danger); }
.iform-code {
  display:     block; width: 100%;
  padding:     12px 14px;
  background:  var(--bg-elevated);
  border:      none; outline: none;
  color:       var(--cyan-200);
  font-family: var(--font-mono);
  font-size:   var(--text-sm);
  line-height: var(--leading-relaxed);
  resize:      vertical; min-height: 180px;
  tab-size:    2;
}
.iform-code::placeholder { color: var(--text-tertiary); font-style: italic; }
@media (max-width: 479px) { .iform-code { font-size: var(--text-xs); min-height: 140px; } }

.iform-field-error { display: flex; align-items: center; gap: 4px; font-size: var(--text-xs); color: var(--danger); font-weight: 500; }

/* Organize */
.iform-organize { display: flex; flex-direction: column; gap: 12px; }

/* Checkbox */
.iform-checkbox { display: flex; align-items: center; gap: 10px; cursor: pointer; position: relative; width: fit-content; }
.iform-check {
  display: flex; align-items: center; justify-content: center;
  width: 18px; height: 18px;
  background: var(--bg-subtle); border: 1px solid var(--border-default);
  border-radius: var(--radius-sm); flex-shrink: 0;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.iform-check--on { background: var(--accent); border-color: var(--accent); color: white; }
.iform-check-label { display: flex; align-items: center; gap: 6px; font-size: var(--text-sm); color: var(--text-secondary); }

`;
