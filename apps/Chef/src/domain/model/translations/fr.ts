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
    add: {
      success:
        'Ajout de {{nbWords}} mots au décompte, {{initial}} -> {{total}}.',
    },
    objective: {
      set: {
        message:
          'Objectif fixé à : **{{nbWords}} mots**. Au travail, go go go !',
      },
      reset: {
        message:
          "Objectif désactivé. Travailler sans pression, c'est bien aussi !",
      },
    },
    set: {
      increase: {
        message: 'Ça fait {{nbWords}} mots ajoutés sur cette session !',
      },
      reset: {
        message:
          'Ok, on repart de 0. Un nouveau jour, une nouvelle résolution !',
      },
    },
    view: {
      baseMessage: 'Total de mots : {{nbWords}}.',
      progress: 'Progression : {{nbWords}} / {{objective}} ({{progress}}%).',
      objective: {
        nano: {
          notStarted: 'Dès que le MoMo commence, je te dirais où tu en es.',
          started: 'Progression évènement : {{ratio}}%.',
          progress: {
            veryLate: "Allez, on ne lâche rien, ce n'est pas fini !",
            slightlyLate: "Un peu de retard, mais rien d'inquiétant !",
            onTime: 'Tu es au top !',
            wayAhead: 'Piece of Cake, comme ils disent au Nord de la Manche !',
          },
        },
      },
    },
  },
};
