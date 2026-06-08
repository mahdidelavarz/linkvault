"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type Project, PROJECT_COLORS } from "@/types/project";
import { useCreateProject, useUpdateProject } from "@/hooks/useProjects";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FormLayout from "@/components/layout/FormLayout";
import Textarea from "@/components/ui/TextArea";

const schema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().max(2000).optional(),
    color: z.string().optional(),
    emoji: z.string().max(10).optional(),
});
type FormData = z.infer<typeof schema>;

interface ProjectFormProps {
    project?: Project | null;
    onClose: () => void;
}

export default function ProjectForm({ project, onClose }: ProjectFormProps) {
    const isEditing = !!project;
    const createProject = useCreateProject();
    const updateProject = useUpdateProject();
    const isLoading = createProject.isPending || updateProject.isPending;
    const error = createProject.error || updateProject.error;

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { title: '', description: '', color: 'cyan', emoji: '' },
    });

    const watchedColor = watch('color');

    useEffect(() => {
        if (project) {
            reset({
                title: project.title,
                description: project.description ?? '',
                color: project.color ?? 'cyan',
                emoji: project.emoji ?? '',
            });
        }
    }, [project, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            if (isEditing && project) {
                await updateProject.mutateAsync({ id: project.id, ...data });
            } else {
                await createProject.mutateAsync(data);
            }
            onClose();
        } catch { /* shown via error */ }
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
                            {isEditing ? 'Save changes' : 'Create project'}
                        </Button>
                    </>
                }
            >
                <div className="pform-content">
                    {error && (
                        <div className="pform-error">
                            {error instanceof Error ? error.message : 'Something went wrong'}
                        </div>
                    )}

                    {/* Emoji + Title row */}
                    <div className="pform-row">
                        <div className="pform-field pform-field--emoji">
                            <label className="pform-label">Icon</label>
                            <input
                                type="text"
                                className="pform-emoji-input"
                                placeholder="📁"
                                maxLength={10}
                                {...register('emoji')}
                            />
                        </div>
                        <div className="pform-field pform-field--title">
                            <Input
                                label="Project name"
                                placeholder="My Project"
                                error={errors.title?.message}
                                autoFocus
                                {...register('title')}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <Textarea
                        label="Description"
                        placeholder="What is this project for?"
                        optional
                        rows={2}
                        {...register('description')}
                    />

                    {/* Color picker */}
                    <div className="pform-field">
                        <label className="pform-label">Color</label>
                        <div className="pform-colors">
                            {PROJECT_COLORS.map(c => (
                                <button
                                    key={c.value}
                                    type="button"
                                    className={['pform-color', watchedColor === c.value ? 'pform-color--active' : ''].filter(Boolean).join(' ')}
                                    style={{ '--color': c.css } as React.CSSProperties}
                                    onClick={() => setValue('color', c.value)}
                                    title={c.label}
                                    aria-label={c.label}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </FormLayout>
        </>
    );
}

const CSS = `
.pform-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px 0 8px;
}
.pform-error {
    padding: 10px 14px;
    background: var(--danger-muted);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    color: var(--danger);
}
.pform-row { display: flex; gap: 12px; align-items: flex-end; }
.pform-field { display: flex; flex-direction: column; gap: 6px; }
.pform-field--emoji { flex-shrink: 0; }
.pform-field--title { flex: 1; }
.pform-label { font-size: var(--text-xs); font-weight: 600; color: var(--text-secondary); }
.pform-emoji-input {
    width: 52px; height: 52px;
    font-size: 22px; text-align: center;
    background: var(--bg-elevated); border: 1px solid var(--border-default);
    border-radius: var(--radius-md); color: var(--text-primary);
    cursor: text; outline: none;
    transition: border-color var(--transition-fast);
}
.pform-emoji-input:focus { border-color: var(--border-focus); }
.pform-colors { display: flex; flex-wrap: wrap; gap: 8px; }
.pform-color {
    width: 24px; height: 24px;
    border-radius: 50%;
    background: var(--color);
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.15s, border-color 0.15s;
}
.pform-color:hover { transform: scale(1.15); }
.pform-color--active {
    border-color: var(--color);
    box-shadow: 0 0 0 2px var(--bg-surface), 0 0 0 4px var(--color);
    transform: scale(1.1);
}
`;
