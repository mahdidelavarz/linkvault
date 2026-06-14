import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Link } from '../entities/Link';
import { Note } from '../entities/Note';
import { Snippet } from '../entities/Snippet';
import { Prompt } from '../entities/Prompt';
import { ApiCollection } from '../entities/ApiCollection';
import { Infrastructure } from '../entities/Infrastructure';
import { Project } from '../entities/Project';

export class AdminService {
    private userRepository = AppDataSource.getRepository(User);
    private linkRepository = AppDataSource.getRepository(Link);
    private noteRepository = AppDataSource.getRepository(Note);
    private snippetRepository = AppDataSource.getRepository(Snippet);
    private promptRepository = AppDataSource.getRepository(Prompt);
    private apiCollectionRepository = AppDataSource.getRepository(ApiCollection);
    private infrastructureRepository = AppDataSource.getRepository(Infrastructure);
    private projectRepository = AppDataSource.getRepository(Project);

    private async countsByUser(repository: { createQueryBuilder: Function }, alias: string): Promise<Map<number, number>> {
        const rows = await (repository as any)
            .createQueryBuilder(alias)
            .select(`${alias}.userId`, 'userId')
            .addSelect('COUNT(*)', 'count')
            .groupBy(`${alias}.userId`)
            .getRawMany();

        return new Map(rows.map((row: any) => [Number(row.userId), Number(row.count)]));
    }

    async getOverview() {
        const [
            totalUsers,
            users,
            linkCounts,
            noteCounts,
            snippetCounts,
            promptCounts,
            apiCollectionCounts,
            infrastructureCounts,
            projectCounts,
        ] = await Promise.all([
            this.userRepository.count(),
            this.userRepository.find({ order: { createdAt: 'ASC' } }),
            this.countsByUser(this.linkRepository, 'link'),
            this.countsByUser(this.noteRepository, 'note'),
            this.countsByUser(this.snippetRepository, 'snippet'),
            this.countsByUser(this.promptRepository, 'prompt'),
            this.countsByUser(this.apiCollectionRepository, 'apiCollection'),
            this.countsByUser(this.infrastructureRepository, 'infrastructure'),
            this.countsByUser(this.projectRepository, 'project'),
        ]);

        return {
            totalUsers,
            users: users.map((user) => ({
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                linksCount: linkCounts.get(user.id) ?? 0,
                notesCount: noteCounts.get(user.id) ?? 0,
                snippetsCount: snippetCounts.get(user.id) ?? 0,
                promptsCount: promptCounts.get(user.id) ?? 0,
                apiCollectionsCount: apiCollectionCounts.get(user.id) ?? 0,
                infrastructureCount: infrastructureCounts.get(user.id) ?? 0,
                projectsCount: projectCounts.get(user.id) ?? 0,
            })),
        };
    }
}
