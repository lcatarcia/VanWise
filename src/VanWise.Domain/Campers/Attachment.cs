using VanWise.Domain.Common;

namespace VanWise.Domain.Campers;

public sealed class Attachment : Entity
{
    public Guid CamperId { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public string ContentType { get; private set; } = string.Empty;
    public string StoragePath { get; private set; } = string.Empty;
    public string Caption { get; private set; } = string.Empty;
    public int SortOrder { get; private set; }
    public bool IsPhoto { get; private set; }

    private Attachment()
    {
    }

    public Attachment(Guid camperId, string fileName, string contentType, string storagePath, bool isPhoto)
        : this(camperId, fileName, contentType, storagePath, string.Empty, 0, isPhoto)
    {
    }

    public Attachment(Guid camperId, string fileName, string contentType, string storagePath, string caption, int sortOrder, bool isPhoto)
    {
        CamperId = camperId;
        FileName = fileName.Trim();
        ContentType = contentType.Trim();
        StoragePath = storagePath.Trim();
        Caption = caption.Trim();
        SortOrder = sortOrder;
        IsPhoto = isPhoto;
    }

    public static Attachment RemotePhoto(Guid camperId, string imageUrl, int sortOrder)
    {
        var fileName = GetRemoteFileName(imageUrl, sortOrder);
        return new Attachment(camperId, fileName, "image/*", imageUrl, string.Empty, sortOrder, true);
    }

    public void UpdateRemotePhoto(string imageUrl, int sortOrder)
    {
        FileName = GetRemoteFileName(imageUrl, sortOrder);
        ContentType = "image/*";
        StoragePath = imageUrl.Trim();
        Caption = string.Empty;
        SortOrder = sortOrder;
        IsPhoto = true;
        MarkUpdated();
    }

    private static string GetRemoteFileName(string imageUrl, int sortOrder)
    {
        var uri = new Uri(imageUrl, UriKind.Absolute);
        var fileName = Path.GetFileName(uri.LocalPath);
        if (string.IsNullOrWhiteSpace(fileName))
        {
            fileName = $"camper-photo-{sortOrder + 1}.jpg";
        }

        return fileName;
    }
}
