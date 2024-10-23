export const frTranslations = {
  ping: {
    command: {
      name: 'coucou',
      description: 'Dit bonjour',
    },
    response: 'Coucou !',
  },
  wordCount: {
    command: {
      name: 'compte',
      description: 'Gère le décompte des mots',
      subCommands: {
        add: {
          name: 'ajoute',
          description: 'Ajoute un compte de mots au décompte',
          options: {
            wordCount: {
              name: 'nombre-de-mots',
              description: 'Le nombre de mots à ajouter',
            },
          },
        },
        objective: {
          name: 'objectif',
          description: "Fixe l'objectif de mots à atteindre",
          options: {
            wordCount: {
              name: 'nombre-de-mots',
              description: 'Le nombre de mots cible. 0 pour annuler',
            },
            event: {
              name: 'évènement',
              description:
                "le nom de l'événement associé. Valeur possible : MoMo",
              choices: [{ name: 'MoMo', value: 'MoMo' }],
            },
          },
        },
        declare: {
          name: 'déclare',
          description: 'Déclare un nombre de mots. 0 pour réinitialiser',
          options: {
            wordCount: {
              name: 'nombre-de-mots',
              description: 'Le nombre de mots cible. 0 pour réinitialiser',
            },
          },
        },
        view: {
          name: 'voir',
          description: 'Voir le décompte',
        },
      },
    },
  },
  objective: {
    reached: 'Objectif atteint!',
  },
};
