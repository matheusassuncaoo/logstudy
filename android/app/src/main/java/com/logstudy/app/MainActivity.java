package com.logstudy.app;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "LogStudy";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Habilitar debug do WebView para Chrome Remote Debugging
        WebView.setWebContentsDebuggingEnabled(true);
        Log.d(TAG, "✅ MainActivity onCreate - WebView debugging enabled");
        Log.d(TAG, "✅ App started successfully");
    }
    
    @Override
    public void onResume() {
        super.onResume();
        Log.d(TAG, "✅ MainActivity onResume");
        
        // Limpar cache do WebView para forçar reload dos novos chunks
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            webView.clearCache(true);
            webView.clearHistory();
            WebSettings settings = webView.getSettings();
            settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
            Log.d(TAG, "✅ WebView cache cleared - forcing fresh load");
        }
    }
}
