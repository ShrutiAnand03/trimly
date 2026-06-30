import re
from unittest.mock import patch

import pytest

from app.utils.code_generator import generate_short_code


def test_generate_short_code_default_length():
    code = generate_short_code()

    assert len(code) == 6


@pytest.mark.parametrize("length", [1, 8, 12])
def test_generate_short_code_custom_length(length):
    code = generate_short_code(length=length)

    assert len(code) == length


def test_generate_short_code_alphanumeric_charset():
    code = generate_short_code(length=50)

    assert re.fullmatch(r"^[a-zA-Z0-9]+$", code)


def test_generate_short_code_uses_secrets_choice():
    with patch("app.utils.code_generator.secrets.choice", return_value="a"):
        code = generate_short_code(length=4)

    assert code == "aaaa"
