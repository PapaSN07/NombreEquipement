import logging

from ldap3 import SIMPLE, Connection, Server
from ldap3.core.exceptions import LDAPException

from app.core.config import settings

log = logging.getLogger(__name__)


def authenticate(identifiant: str, mot_de_passe: str) -> bool:
    if not mot_de_passe:  # un mot de passe vide donnerait un bind anonyme réussi
        return False

    server = Server(settings.LDAP_SERVER, connect_timeout=settings.LDAP_TIMEOUT)
    conn = None
    try:
        conn = Connection(
            server,
            user=identifiant,
            password=mot_de_passe,
            authentication=SIMPLE,
            receive_timeout=settings.LDAP_TIMEOUT,
        )
        conn.open()
        try:
            conn.start_tls()
        except LDAPException as e:
            # StartTLS indisponible : le mot de passe circulera en clair
            log.warning("StartTLS indisponible (%s), bind non chiffré", e)
        ok = conn.bind()
        if not ok:
            log.warning("Échec LDAP pour %s : %s", identifiant, conn.result)
        return bool(ok)
    except LDAPException as e:
        log.warning("Échec LDAP pour %s : %s", identifiant, e)
        return False
    finally:
        if conn is not None:
            try:
                conn.unbind()
            except LDAPException:
                pass