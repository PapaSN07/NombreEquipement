from sqlalchemy import BigInteger, Integer

# BIGINT sur SQL Server ; INTEGER sur SQLite (seul type auto-incrémenté par SQLite)
BigInt = BigInteger().with_variant(Integer, "sqlite")
