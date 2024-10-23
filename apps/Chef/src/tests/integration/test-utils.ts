import { Interaction } from '../../domain/model/interaction';

export function getTag(interaction: Interaction): string {
  return `<@${interaction.user.id}> `;
}
