import re

with open('src/components/DutyManager.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

state_inject = """  const [coverMobileFilter, setCoverMobileFilter] = useState<'all' | 'absent' | 'has_schedule'>('all');
  
  // Quick Cover States
  const [showQuickCoverModal, setShowQuickCoverModal] = useState(false);
  const [quickCoverTeacher, setQuickCoverTeacher] = useState('');
  const [quickCoverStatus, setQuickCoverStatus] = useState('raporlu');
  const [showShareModal, setShowShareModal] = useState(false);"""

code = code.replace("  const [coverMobileFilter, setCoverMobileFilter] = useState<'all' | 'absent' | 'has_schedule'>('all');", state_inject, 1)

with open('src/components/DutyManager.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
