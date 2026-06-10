import secrets
import string

alphabet = string.ascii_letters + string.digits

def generate_short_code(
        length:int= 6
    )-> str:
    return ''.join(
        secrets.choice(alphabet)
        for _ in range(length)
    )
