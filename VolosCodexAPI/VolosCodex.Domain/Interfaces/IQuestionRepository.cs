using System.Threading.Tasks;
using VolosCodex.Domain;

namespace VolosCodex.Domain.Interfaces
{
    public interface IQuestionRepository
    {
        Task<string> AskQuestionAsync(string prompt, RpgSystem system);
        Task<string> GetSearchKeywordAsync(string userDescription);
    }
}
