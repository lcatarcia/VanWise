using AutoMapper;
using VanWise.Application.Campers;
using VanWise.Domain.Campers;

namespace VanWise.Application.Mapping;

public sealed class CamperMappingProfile : Profile
{
    public CamperMappingProfile()
    {
        CreateMap<Camper, CamperSummaryDto>();
        CreateMap<Camper, CamperDetailDto>();
    }
}
