def get_role(user):
    """
    Safely return role name of user
    """
    if not user or not hasattr(user, "userprofile"):
        return None

    if not user.userprofile.role:
        return None

    return user.userprofile.role.name
