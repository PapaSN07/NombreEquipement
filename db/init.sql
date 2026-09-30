-- Création idempotente de la base et des tables (schéma identique à la production).
-- Exécuté par le service db-init à chaque `docker compose up` : ne touche à rien si tout existe.
IF DB_ID(N'IndicateursTransportDistribution') IS NULL
    CREATE DATABASE [IndicateursTransportDistribution];
GO

USE [IndicateursTransportDistribution];
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.TypeEquipement', N'U') IS NULL
CREATE TABLE [dbo].[TypeEquipement](
    [IDTypeEquipement] [bigint] NOT NULL,
    [typeequipement] [varchar](50) NULL,
    PRIMARY KEY CLUSTERED ([IDTypeEquipement] ASC)
) ON [PRIMARY];
GO

IF OBJECT_ID(N'dbo.NombreEquipement_TypeEquip', N'U') IS NULL
CREATE TABLE [dbo].[NombreEquipement_TypeEquip](
    [IDNombreEquipement_TypeEquip] [bigint] IDENTITY(1,1) NOT NULL,
    [IDTypeEquipement] [bigint] NOT NULL,
    [Nombre_Equipements] [bigint] NULL,
    [DateDebut] [date] NULL,
    [DateFin] [date] NULL,
    CONSTRAINT [PK_NombreEquipement_TypeEquip] PRIMARY KEY CLUSTERED ([IDNombreEquipement_TypeEquip] ASC)
) ON [PRIMARY];
GO
-- La table Utilisateur est créée par l'application (Base.metadata.create_all).
