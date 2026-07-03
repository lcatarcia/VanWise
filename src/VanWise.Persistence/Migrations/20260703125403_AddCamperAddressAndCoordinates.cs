using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanWise.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCamperAddressAndCoordinates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Campers",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Campers",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Campers",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "Campers");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Campers");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Campers");
        }
    }
}
