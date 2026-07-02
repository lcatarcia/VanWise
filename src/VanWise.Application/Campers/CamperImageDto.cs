namespace VanWise.Application.Campers;

public sealed record CamperImageDto(
    string Url,
    string FileName,
    string Caption,
    int SortOrder);
