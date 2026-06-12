export function parseParamId(param: string | string[] | undefined): number | null {
    if (!param) return null;
    const id = Array.isArray(param) ? param[0] : param;
    const parsed = parseInt(id);
    return isNaN(parsed) ? null : parsed;
}