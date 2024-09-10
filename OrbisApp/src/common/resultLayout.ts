export const resultLayout = {
  "type": "AdaptiveCard",
    "version": "1.3",
    "body": [
        {
            "type": "ColumnSet",
            "columns": [
                {
                    "type": "Column",
                    "width": 8,
                    "items": [
                        {
                            "type": "TextBlock",
                            "text": "__${NAME}__",
                            "color": "accent",
                            "size": "medium",
                            "spacing": "none",
                            "$when": "${name != \"\"}"
                        }
                    ],
                    "horizontalAlignment": "Center",
                    "spacing": "none"
                },
                {
                    "type": "Column",
                    "width": 8,
                    "items": [
                        {
                            "type": "FactSet",
                            "facts": [
                                {
                                    "title": "BvDId:",
                                    "value": "${BvDId}"
                                },
                                {
                                    "title": "Status:",
                                    "value": "${Status}"
                                },
                                {
                                    "title": "EMPL:",
                                    "value": "${EMPL}"
                                },
                                {
                                    "title": "OPRE:",
                                    "value": "${OPRE}"
                                },
                                {
                                    "title": "ORBISID:",
                                    "value": "${ORBISID}"
                                }
                            ]
                        }
                    ],
                    "spacing": "none",
                    "horizontalAlignment": "right"
                }
            ]
        }
    ],
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json"
};