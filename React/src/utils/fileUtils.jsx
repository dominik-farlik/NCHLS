export function openSafetySheet(substance_id) {
    window.open(`/api/substances/safety_sheet/${substance_id}`);
}