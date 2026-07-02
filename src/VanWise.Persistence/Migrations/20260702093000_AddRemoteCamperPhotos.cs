using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;

#nullable disable

namespace VanWise.Persistence.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(VanWiseDbContext))]
    [Migration("20260702093000_AddRemoteCamperPhotos")]
    public partial class AddRemoteCamperPhotos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "StoragePath",
                table: "Attachments",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(600)",
                oldMaxLength: 600);

            migrationBuilder.AddColumn<string>(
                name: "Caption",
                table: "Attachments",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "SortOrder",
                table: "Attachments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_CamperId_SortOrder",
                table: "Attachments",
                columns: new[] { "CamperId", "SortOrder" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Attachments_CamperId_SortOrder",
                table: "Attachments");

            migrationBuilder.DropColumn(
                name: "Caption",
                table: "Attachments");

            migrationBuilder.DropColumn(
                name: "SortOrder",
                table: "Attachments");

            migrationBuilder.AlterColumn<string>(
                name: "StoragePath",
                table: "Attachments",
                type: "nvarchar(600)",
                maxLength: 600,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000);
        }
    }
}
