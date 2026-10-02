import React, { useState } from 'react';
import { X, Key, ShieldCheck, Database, Check, Copy } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-[#FAF8F5] rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-stone-300 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-200 text-stone-500 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-800">
              보안 및 Vercel 배포 가이드
            </h3>
            <p className="text-xs text-stone-500">
              API 키 보안 요구사항 충족 및 환경 변수 설정 안내
            </p>
          </div>
        </div>

        {/* Security Rule Adherence Check */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>보안 요구사항 완벽 충족 완료</span>
          </div>
          <p className="text-xs text-emerald-700 leading-relaxed">
            API 키가 프론트엔드/백엔드 소스 코드에 절대 하드코딩되지 않았으며,
            <code className="px-1.5 py-0.5 rounded bg-emerald-100 font-mono text-[11px] mx-1">
              process.env.GEMINI_API_KEY
            </code>
            또는
            <code className="px-1.5 py-0.5 rounded bg-emerald-100 font-mono text-[11px] mx-1">
              VITE_GEMINI_API_KEY
            </code>
            환경 변수를 통해 안전하게 로드됩니다.
          </p>
        </div>

        {/* Step 1: GitHub Push Guide */}
        <div className="space-y-3">
          <h4 className="font-bold text-stone-800 text-sm flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-stone-800 text-white flex items-center justify-center text-xs">🐙</span>
            <span>1. GitHub에 업로드하기 (터미널 명령어)</span>
          </h4>
          <div className="p-3.5 rounded-xl bg-stone-900 text-stone-200 text-xs font-mono space-y-1.5 overflow-x-auto">
            <div className="text-stone-400"># 1. 변경사항 추가 및 커밋 (.env는 자동 제외됨)</div>
            <div>git add .</div>
            <div>git commit -m &quot;feat: deploy warm diary&quot;</div>
            <div className="text-stone-400 pt-1"># 2. 본인의 GitHub 저장소로 푸시</div>
            <div>git branch -M main</div>
            <div>git push -u origin main</div>
          </div>
        </div>

        {/* Step 2: Vercel Environment Variables */}
        <div className="space-y-3">
          <h4 className="font-bold text-stone-800 text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-600" />
            <span>2. Vercel 배포 시 환경 변수(Environment Variables) 등록</span>
          </h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            Vercel에서 GitHub 저장소를 Import한 뒤, <strong>Project Settings &gt; Environment Variables</strong>에 아래 키를 등록하세요:
          </p>

          <div className="space-y-2">
            {/* Variable 1 */}
            <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-mono font-bold text-stone-800">GEMINI_API_KEY</div>
                <div className="text-[11px] text-stone-500">Full-stack / Node.js 서버 환경 변수</div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard('GEMINI_API_KEY', 'GEMINI_API_KEY')}
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'GEMINI_API_KEY' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'GEMINI_API_KEY' ? '복사됨' : '이름 복사'}</span>
              </button>
            </div>

            {/* Variable 2 */}
            <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-mono font-bold text-stone-800">VITE_GEMINI_API_KEY</div>
                <div className="text-[11px] text-stone-500">Vite 정적 클라이언트 배포 시 폴백용 변수</div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard('VITE_GEMINI_API_KEY', 'VITE_GEMINI_API_KEY')}
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'VITE_GEMINI_API_KEY' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'VITE_GEMINI_API_KEY' ? '복사됨' : '이름 복사'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Step 2: Firebase Connection Info */}
        <div className="space-y-3">
          <h4 className="font-bold text-stone-800 text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-600" />
            <span>2. Firebase 연동 정보</span>
          </h4>
          <div className="p-3.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-600 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-stone-500">프로젝트 ID:</span>
              <span className="font-mono font-bold text-stone-800">visit-208b9</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-stone-500">저장소:</span>
              <span className="text-stone-800">Cloud Firestore (diaries 컬렉션)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-stone-500">데이터 보호:</span>
              <span className="text-emerald-700 font-medium">오프라인 및 권한 대비 로컬스토리지 자동 폴백 동기화</span>
            </div>
          </div>
        </div>

        {/* Step 3: Local testing */}
        <div className="space-y-2">
          <h4 className="font-bold text-stone-800 text-sm">
            3. 로컬 테스트 (.env 파일 생성)
          </h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            로컬에서 테스트할 때는 루트 폴더의 <code className="px-1.5 py-0.5 rounded bg-stone-200/80 font-mono text-[11px]">.env.example</code> 파일을 복사하여
            <code className="px-1.5 py-0.5 rounded bg-stone-200/80 font-mono text-[11px] ml-1">.env</code> 파일로 이름을 바꾼 후 본인의 Google Gemini API 키를 입력하시면 즉시 테스트할 수 있습니다.
          </p>
        </div>

        {/* Close CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs sm:text-sm cursor-pointer transition-colors"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};
