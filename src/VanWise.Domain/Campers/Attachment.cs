using VanWise.Domain.Common;

namespace VanWise.Domain.Campers;

public sealed class Attachment : Entity
{
    public Guid CamperId { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public string ContentType { get; private set; } = string.Empty;
    public string StoragePath { get; private set; } = string.Empty;
    public bool IsPhoto { get; private set; }

    private Attachment()
    {
    }

    public Attachment(Guid camperId, string fileName, string contentType, string storagePath, bool isPhoto)
    {
        CamperId = camperId;
        FileName = fileName.Trim();
        ContentType = contentType.Trim();
        StoragePath = storagePath.Trim();
        IsPhoto = isPhoto;
    }
}
