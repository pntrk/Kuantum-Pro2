import json

code = """
                                      try {
                                        const card = JSON.parse(hasLesson);
                                        lessonInfo = `${card.classes?.join(', ') || ''} ${card.subject || ''}`.trim();
                                      } catch(e) {
                                        lessonInfo = hasLesson;
                                      }
"""
print(code)
