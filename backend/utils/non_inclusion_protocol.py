from constants.protocol_categories import DangerCategory


def category_code(cat: "DangerCategory") -> str:
    if not cat or cat == DangerCategory.NONE:
        return ""
    return str(cat.value).strip().split(" ", 1)[0]

def format_meta_form(form) -> str:
    if not form:
        return ""
    return getattr(form, "value", str(form))

def format_meta_properties(props: tuple[str, ...] | None) -> str:
    if not props:
        return ""
    return ", ".join(props)