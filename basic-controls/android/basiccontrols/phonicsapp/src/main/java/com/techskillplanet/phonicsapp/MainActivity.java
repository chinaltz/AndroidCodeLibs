package com.techskillplanet.phonicsapp;

import android.Manifest;
import android.app.Activity;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.res.AssetFileDescriptor;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaRecorder;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.FrameLayout;
import android.widget.GridLayout;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import com.techskillplanet.basiccontrols.theme.BasicColors;
import com.techskillplanet.basiccontrols.theme.BasicStyle;
import com.techskillplanet.basiccontrols.theme.BasicThemeManager;
import com.techskillplanet.basiccontrols.widget.BasicAlertView;
import com.techskillplanet.basiccontrols.widget.BasicBottomTabView;
import com.techskillplanet.basiccontrols.widget.BasicButton;
import com.techskillplanet.basiccontrols.widget.BasicCardView;
import com.techskillplanet.basiccontrols.widget.BasicProgressView;
import com.techskillplanet.basiccontrols.widget.BasicTopBarView;
import com.techskillplanet.basiccontrols.widget.BasicToast;
import com.techskillplanet.basiccontrols.i18n.BasicI18nManager;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.Set;

/**
 * 音标星球一期 App。
 *
 * <p>当前版本是纯单机 MVP：48 音标学习地图、单音标学习、3 题过关检查。
 * 音频只从 assets/audio 读取，缺失时提示待录制，不访问网络。</p>
 */
public class MainActivity extends Activity {
    private static final String TAG = "PhonicsAudio";
    private static final String PREFS = "phonics_progress";
    private static final String KEY_DONE = "done_ids";
    private static final String KEY_LANGUAGE = "language";
    private static final String KEY_THEME = "theme_key";
    private static final String KEY_LEGACY_NIGHT = "night_theme";
    private static final String THEME_SKY = "sky";
    private static final String THEME_NIGHT = "night";
    private static final String[] THEME_KEYS = {THEME_SKY, THEME_NIGHT};
    private static final long CHECK_AUTO_ADVANCE_MS = 650L;
    private static final int REQ_RECORD_AUDIO = 2401;

    private static final int SKY = Color.rgb(221, 244, 255);
    private static final int BLUE = Color.rgb(49, 168, 255);
    private static final int BLUE_DARK = Color.rgb(20, 121, 214);
    private static final int CYAN = Color.rgb(67, 207, 199);
    private static final int SUN = Color.rgb(255, 209, 102);

    private BasicColors colors;
    private BasicStyle style;
    private SharedPreferences prefs;
    private LinearLayout root;
    private ScrollView scrollView;
    private LinearLayout appBarHost;
    private LinearLayout actionHost;
    private View statusSpacer;
    private View homeTopBar;
    private BasicTopBarView topBar;
    private BasicBottomTabView bottomTab;
    private BasicProgressView progressView;
    private TextView progressText;
    private TextView screenTitle;
    private TextView screenSubtitle;
    private BasicButton primaryAction;
    private final Set<String> completed = new HashSet<>();
    private Phoneme current;
    private Screen screen = Screen.MAP;
    private int selectedListenAnswer = -1;
    private int selectedWordAnswer = -1;
    private int checkStep = 0;
    private List<String> listenOptions = new ArrayList<>();
    private int listenCorrectIndex = -1;
    private List<String> wordOptions = new ArrayList<>();
    private int wordCorrectIndex = -1;
    private Random checkRandom;
    private MediaPlayer activePlayer;
    private MediaPlayer recordingPlayer;
    private MediaRecorder recorder;
    private File currentRecordingFile;
    private boolean isRecording;
    private boolean hasRecording;
    private String language;
    private String themeKey;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final Map<String, File> cachedAudioFiles = new HashMap<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        language = prefs.getString(KEY_LANGUAGE, "zh-CN");
        themeKey = readThemeKey();
        applyThemeBundle();
        BasicI18nManager.init(this, "local.json", language);
        completed.addAll(prefs.getStringSet(KEY_DONE, new HashSet<>()));
        current = firstUnfinished();
        configureSystemBars();
        setContentView(createContent());
        showMap();
    }

    @Override
    protected void onDestroy() {
        mainHandler.removeCallbacks(checkAdvanceRunnable);
        stopRecording(false);
        releaseRecordingPlayer();
        releaseActivePlayer();
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (handleBack()) {
            return;
        }
        super.onBackPressed();
    }

    private void configureSystemBars() {
        Window window = getWindow();
        window.setStatusBarColor(pageStart());
        window.setNavigationBarColor(currentTheme().dark ? colors.backgroundPageGradientEnd : colors.backgroundSurfaceRaised);
        if (android.os.Build.VERSION.SDK_INT >= 23) {
            window.getDecorView().setSystemUiVisibility(currentTheme().dark ? 0 : View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        }
    }

    private View createContent() {
        FrameLayout frame = new FrameLayout(this);
        frame.setBackground(gradient(pageStart(), pageEnd(), dp(0), 0));

        LinearLayout shell = new LinearLayout(this);
        shell.setOrientation(LinearLayout.VERTICAL);
        frame.addView(shell, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));

        appBarHost = new LinearLayout(this);
        appBarHost.setOrientation(LinearLayout.VERTICAL);
        appBarHost.setBackgroundColor(pageStart());
        statusSpacer = new View(this);
        appBarHost.addView(statusSpacer, fixed(ViewGroup.LayoutParams.MATCH_PARENT, 0));
        appBarHost.setOnApplyWindowInsetsListener((view, insets) -> {
            ViewGroup.LayoutParams params = statusSpacer.getLayoutParams();
            int topInset = insets.getSystemWindowInsetTop();
            if (params != null && params.height != topInset) {
                params.height = topInset;
                statusSpacer.setLayoutParams(params);
            }
            return insets;
        });

        FrameLayout navFrame = new FrameLayout(this);
        homeTopBar = createHomeTopBar();
        navFrame.addView(homeTopBar, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        topBar = new BasicTopBarView(this);
        topBar.setBarBackgroundColor(pageStart());
        topBar.setBarTextColor(colors.textPrimary, colors.textPrimary);
        topBar.setOnBackClickListener(view -> handleBack());
        navFrame.addView(topBar, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        appBarHost.addView(navFrame, fixed(ViewGroup.LayoutParams.MATCH_PARENT, dp(56)));
        shell.addView(appBarHost, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        appBarHost.requestApplyInsets();

        scrollView = new ScrollView(this);
        scrollView.setFillViewport(true);

        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(4), dp(14), dp(4), dp(24));
        scrollView.addView(root, new ScrollView.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        LinearLayout.LayoutParams scrollParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                0,
                1f
        );
        shell.addView(scrollView, scrollParams);

        actionHost = new LinearLayout(this);
        actionHost.setPadding(dp(16), dp(8), dp(16), dp(18));
        actionHost.setGravity(Gravity.CENTER);
        primaryAction = new BasicButton(this);
        primaryAction.setVariant(BasicButton.VARIANT_PRIMARY);
        primaryAction.setOnClickListener(view -> handlePrimaryAction());
        actionHost.addView(primaryAction, fixed(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dp(58)
        ));
        shell.addView(actionHost, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        bottomTab = new BasicBottomTabView(this);
        bottomTab.setTabs(Arrays.asList(
                new BasicBottomTabView.Tab("learn", "⌂", "tab/learn", "学习"),
                new BasicBottomTabView.Tab("settings", "⚙", "tab/settings", "设置")
        ));
        bottomTab.setOnTabSelectedListener((view, index, key) -> {
            if ("settings".equals(key)) {
                showSettings();
            } else {
                showMap();
            }
        });
        bottomTab.setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(dp(12), dp(6), dp(12), dp(6) + insets.getSystemWindowInsetBottom());
            return insets;
        });
        shell.addView(bottomTab, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        bottomTab.requestApplyInsets();
        return frame;
    }

    private void resetPage(String title, String subtitle) {
        root.removeAllViews();
        topBar.setTitle(title);
        topBar.setBarBackgroundColor(pageStart());
        topBar.setBarTextColor(colors.textPrimary, colors.textPrimary);
        appBarHost.setBackgroundColor(pageStart());
        homeTopBar.setVisibility(screen == Screen.MAP ? View.VISIBLE : View.GONE);
        topBar.setVisibility(screen == Screen.MAP ? View.GONE : View.VISIBLE);
        topBar.setBackVisible(
                screen == Screen.LEARN
                        || screen == Screen.CHECK
                        || screen == Screen.SETTINGS_THEME
                        || screen == Screen.SETTINGS_LANGUAGE
        );
        boolean showBottomTab = screen == Screen.MAP || screen == Screen.SETTINGS;
        bottomTab.setVisibility(showBottomTab ? View.VISIBLE : View.GONE);
        bottomTab.setSelectedIndex(isSettingsFlow(screen) ? 1 : 0);
        actionHost.setVisibility(
                screen == Screen.MAP || screen == Screen.LEARN || screen == Screen.CHECK
                        ? View.VISIBLE
                        : View.GONE
        );
        if (screen != Screen.MAP && !isSettingsFlow(screen)) {
            screenTitle = text(title, 22, cTitle(), true);
            root.addView(screenTitle, fullWidth());
            screenSubtitle = text(subtitle, 14, cBody(), false);
            screenSubtitle.setLineSpacing(0, 1.18f);
            if (subtitle != null && subtitle.length() > 0) {
                root.addView(screenSubtitle, withTopMargin(6));
            }
        }
    }

    private boolean isSettingsFlow(Screen value) {
        return value == Screen.SETTINGS
                || value == Screen.SETTINGS_THEME
                || value == Screen.SETTINGS_LANGUAGE;
    }

    private View createHomeTopBar() {
        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setGravity(Gravity.CENTER_VERTICAL);
        header.setPadding(dp(16), 0, dp(16), 0);
        header.setBackgroundColor(pageStart());

        TextView logo = text("☺", 22, Color.WHITE, true);
        logo.setGravity(Gravity.CENTER);
        logo.setBackground(gradient(BLUE, BLUE_DARK, dp(14), 2));
        header.addView(logo, fixed(dp(40), dp(40)));

        LinearLayout titleBox = new LinearLayout(this);
        titleBox.setOrientation(LinearLayout.VERTICAL);
        titleBox.setGravity(Gravity.CENTER_VERTICAL);
        TextView appName = text(t("app/name"), 20, cTitle(), true);
        TextView slogan = text(t("app/slogan"), 12, cMuted(), false);
        titleBox.addView(appName, fullWidth());
        titleBox.addView(slogan, fullWidth());
        LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f);
        titleParams.setMargins(dp(10), 0, 0, 0);
        header.addView(titleBox, titleParams);
        return header;
    }

    private void addProgressCard() {
        BasicCardView card = new BasicCardView(this);
        LinearLayout box = vertical();
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        progressText = text(tf("page/map/progress", completed.size(), PHONEMES.size()), 15, cTitle(), true);
        row.addView(progressText, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
        row.addView(chipLabel(Math.round(progressRatio() * 100) + "%", SUN, cTitle()), wrap());
        box.addView(row, fullWidth());
        progressView = new BasicProgressView(this);
        progressView.setProgress(progressRatio());
        box.addView(progressView, withTopMargin(12));
        TextView hint = text(t("page/map/hint"), 13, cMuted(), false);
        box.addView(hint, withTopMargin(10));
        card.addView(box, fullWidth());
        root.addView(card, withTopMargin(16));
    }

    private void showMap() {
        screen = Screen.MAP;
        stopRecording(false);
        resetPage(t("app/name"), t("page/map/subtitle"));
        addProgressCard();

        for (PhonemeGroup group : GROUPS) {
            root.addView(groupCard(group), withTopMargin(14));
        }
        primaryAction.setBasicText(tf("btn/start_learn", current.symbol));
        scrollTop();
    }

    private BasicCardView groupCard(PhonemeGroup group) {
        BasicCardView card = new BasicCardView(this);
        LinearLayout box = vertical();

        LinearLayout head = new LinearLayout(this);
        head.setOrientation(LinearLayout.HORIZONTAL);
        head.setGravity(Gravity.CENTER_VERTICAL);
        head.addView(text(group.title, 18, cTitle(), true), new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
        head.addView(chipLabel(group.items.size() + " 关", Color.rgb(230, 246, 255), BLUE_DARK), wrap());
        box.addView(head, fullWidth());

        GridLayout grid = new GridLayout(this);
        grid.setColumnCount(4);
        grid.setUseDefaultMargins(false);
        for (Phoneme phoneme : group.items) {
            grid.addView(phonemeCell(phoneme));
        }
        box.addView(grid, withTopMargin(12));
        card.addView(box, fullWidth());
        return card;
    }

    private TextView phonemeCell(Phoneme phoneme) {
        TextView cell = text(phoneme.symbol, 17, cTitle(), true);
        cell.setGravity(Gravity.CENTER);
        boolean done = completed.contains(phoneme.id);
        boolean active = phoneme.id.equals(current.id);
        int fill = done ? cDoneFill() : active ? cActiveFill() : cPaper();
        int stroke = done ? CYAN : active ? SUN : cLine();
        cell.setBackground(rounded(fill, stroke, dp(14), dp(2)));
        cell.setOnClickListener(view -> {
            current = phoneme;
            showLearn();
        });
        GridLayout.LayoutParams params = new GridLayout.LayoutParams();
        params.width = 0;
        params.height = dp(54);
        params.columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f);
        params.setMargins(dp(4), dp(4), dp(4), dp(4));
        cell.setLayoutParams(params);
        return cell;
    }

    private void showLearn() {
        screen = Screen.LEARN;
        stopRecording(false);
        resetPage(tf("page/learn/title", current.symbol), current.mouthTip);

        BasicCardView sound = new BasicCardView(this);
        LinearLayout soundBox = vertical();
        TextView symbol = text(current.symbol, 88, cTitle(), true);
        symbol.setGravity(Gravity.CENTER);
        symbol.setBackground(gradient(Color.rgb(232, 250, 255), Color.rgb(255, 253, 240), dp(24), 1));
        soundBox.addView(symbol, fixed(ViewGroup.LayoutParams.MATCH_PARENT, dp(160)));

        BasicButton play = new BasicButton(this);
        play.setVariant(BasicButton.VARIANT_PRIMARY);
        play.setBasicText(t("btn/play"));
        play.setOnClickListener(view -> playAsset(current.audioPath, current.symbol));
        soundBox.addView(play, withTopMargin(14));

        BasicAlertView tip = new BasicAlertView(this);
        tip.setVariant(BasicAlertView.VARIANT_SUCCESS);
        tip.setTitle(t("page/learn/mouth_title"));
        tip.setMessage(current.mouthTip);
        soundBox.addView(tip, withTopMargin(14));
        sound.addView(soundBox, fullWidth());
        root.addView(sound, withTopMargin(16));

        TextView wordsTitle = text(t("page/learn/words_title"), 18, cTitle(), true);
        root.addView(wordsTitle, withTopMargin(18));
        for (Word word : current.words) {
            root.addView(wordCard(word), withTopMargin(10));
        }

        primaryAction.setBasicText(t("btn/go_check"));
        preloadAudioAsync(current.audioPath, current.words[0].audioPath, current.words[1].audioPath, current.words[2].audioPath);
        scrollTop();
    }

    private BasicCardView wordCard(Word word) {
        BasicCardView card = new BasicCardView(this);
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        LinearLayout textBox = vertical();
        textBox.addView(text(word.text, 28, cTitle(), true), fullWidth());
        textBox.addView(text(word.tip, 13, cMuted(), false), withTopMargin(4));
        row.addView(textBox, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));

        BasicButton play = new BasicButton(this);
        play.setVariant(BasicButton.VARIANT_DEFAULT);
        play.setBasicText(t("btn/play"));
        play.setOnClickListener(view -> playAsset(word.audioPath, word.text));
        row.addView(play, fixed(dp(86), dp(48)));
        card.addView(row, fullWidth());
        return card;
    }

    private void showCheck() {
        screen = Screen.CHECK;
        selectedListenAnswer = -1;
        selectedWordAnswer = -1;
        checkStep = 0;
        hasRecording = false;
        checkRandom = new Random(current.id.hashCode() ^ (int) System.nanoTime());
        showCheckStep();
    }

    private void showCheckStep() {
        screen = Screen.CHECK;
        resetPage(t("page/check/title"), "");
        if (checkStep == 0) {
            prepareListenQuestion();
            root.addView(questionCard(
                    t("check/q1_label"),
                    t("check/q1_title"),
                    listenOptions,
                    listenCorrectIndex
            ), withTopMargin(16));
            primaryAction.setBasicText(t("btn/next"));
        } else if (checkStep == 1) {
            prepareWordQuestion();
            root.addView(wordQuestionCard(), withTopMargin(16));
            primaryAction.setBasicText(t("btn/next"));
        } else {
            root.addView(speakingQuestionCard(), withTopMargin(16));
            primaryAction.setBasicText(tf("btn/finish", current.symbol));
        }
        scrollTop();
    }

    /** 听音题：本题音标 + 同组/其他音标干扰项，保证 4 项不重复。 */
    private void prepareListenQuestion() {
        listenOptions = buildListenOptions();
        listenCorrectIndex = listenOptions.indexOf(current.symbol);
    }

    private List<String> buildListenOptions() {
        Set<String> seen = new HashSet<>();
        List<String> options = new ArrayList<>();
        options.add(current.symbol);
        seen.add(current.symbol);

        List<Phoneme> sameGroup = new ArrayList<>();
        List<Phoneme> otherGroup = new ArrayList<>();
        for (Phoneme candidate : PHONEMES) {
            if (candidate.id.equals(current.id)) {
                continue;
            }
            if (candidate.groupTitle.equals(current.groupTitle)) {
                sameGroup.add(candidate);
            } else {
                otherGroup.add(candidate);
            }
        }
        Collections.shuffle(sameGroup, checkRandom);
        Collections.shuffle(otherGroup, checkRandom);
        appendUniqueSymbols(options, seen, sameGroup);
        appendUniqueSymbols(options, seen, otherGroup);
        Collections.shuffle(options, checkRandom);
        return options;
    }

    private void appendUniqueSymbols(List<String> options, Set<String> seen, List<Phoneme> pool) {
        for (Phoneme candidate : pool) {
            if (options.size() >= 4) {
                return;
            }
            if (seen.add(candidate.symbol)) {
                options.add(candidate.symbol);
            }
        }
    }

    /** 看词题：1 个正确例词 + 2 个来自其他音标的干扰词，保证不重复且仅一个正确答案。 */
    private void prepareWordQuestion() {
        wordOptions = buildWordOptions();
        String correct = current.words[0].text;
        wordCorrectIndex = wordOptions.indexOf(correct);
    }

    private List<String> buildWordOptions() {
        String correct = current.words[0].text;
        Set<String> forbidden = new HashSet<>();
        for (Word word : current.words) {
            forbidden.add(word.text.toLowerCase(Locale.ROOT));
        }

        List<String> preferred = new ArrayList<>();
        List<String> fallback = new ArrayList<>();
        for (Phoneme other : PHONEMES) {
            if (other.id.equals(current.id)) {
                continue;
            }
            for (Word word : other.words) {
                String lower = word.text.toLowerCase(Locale.ROOT);
                if (forbidden.contains(lower)) {
                    continue;
                }
                if (other.groupTitle.equals(current.groupTitle)) {
                    preferred.add(word.text);
                } else {
                    fallback.add(word.text);
                }
            }
        }
        Collections.shuffle(fallback, checkRandom);
        Collections.shuffle(preferred, checkRandom);

        List<String> wrongs = new ArrayList<>();
        Set<String> picked = new HashSet<>(forbidden);
        pickUniqueWords(wrongs, picked, fallback, 2);
        pickUniqueWords(wrongs, picked, preferred, 2);

        List<String> options = new ArrayList<>();
        options.add(correct);
        options.addAll(wrongs);
        Collections.shuffle(options, checkRandom);
        return options;
    }

    private void pickUniqueWords(List<String> target, Set<String> picked, List<String> pool, int limit) {
        for (String word : pool) {
            if (target.size() >= limit) {
                return;
            }
            if (picked.add(word.toLowerCase(Locale.ROOT))) {
                target.add(word);
            }
        }
    }

    private BasicCardView questionCard(String label, String title, List<String> answers, int correctIndex) {
        BasicCardView card = new BasicCardView(this);
        LinearLayout box = vertical();
        box.addView(text(label, 14, BLUE_DARK, true), fullWidth());
        box.addView(text(title, 22, cTitle(), true), withTopMargin(8));

        BasicButton listen = new BasicButton(this);
        listen.setVariant(BasicButton.VARIANT_PRIMARY);
        listen.setBasicText(t("btn/play"));
        listen.setOnClickListener(view -> playAsset(current.audioPath, t("page/check/title")));
        box.addView(listen, withTopMargin(14));

        LinearLayout optionsBox = vertical();
        for (int i = 0; i < answers.size(); i++) {
            final int index = i;
            TextView option = text(answers.get(i), 22, cTitle(), true);
            option.setGravity(Gravity.CENTER);
            option.setBackground(rounded(cPaper(), cLine(), dp(16), dp(2)));
            option.setOnClickListener(view -> {
                selectedListenAnswer = index;
                updateOptionSelection(optionsBox, index);
                if (index == correctIndex) {
                    BasicToast.show(this, t("toast/correct"), "success", Toast.LENGTH_SHORT);
                    scheduleCheckAdvance(this::advanceListenQuestion);
                } else {
                    BasicToast.show(this, t("toast/try_again"), "warning", Toast.LENGTH_SHORT);
                }
            });
            optionsBox.addView(option, withTopMargin(10, dp(56)));
        }
        box.addView(optionsBox, fullWidth());
        card.addView(box, fullWidth());
        return card;
    }

    private BasicCardView wordQuestionCard() {
        BasicCardView card = new BasicCardView(this);
        LinearLayout box = vertical();
        box.addView(text(t("check/q2_label"), 14, BLUE_DARK, true), fullWidth());
        box.addView(text(tf("check/q2_title", current.symbol), 22, cTitle(), true), withTopMargin(8));

        LinearLayout optionsBox = vertical();
        for (int i = 0; i < wordOptions.size(); i++) {
            final int index = i;
            TextView option = text(wordOptions.get(i), 22, cTitle(), true);
            option.setGravity(Gravity.CENTER);
            option.setBackground(rounded(cPaper(), cLine(), dp(16), dp(2)));
            option.setOnClickListener(view -> {
                selectedWordAnswer = index;
                updateOptionSelection(optionsBox, index);
                if (index == wordCorrectIndex) {
                    BasicToast.show(this, t("toast/correct"), "success", Toast.LENGTH_SHORT);
                    scheduleCheckAdvance(this::advanceWordQuestion);
                } else {
                    BasicToast.show(this, t("toast/try_again"), "warning", Toast.LENGTH_SHORT);
                }
            });
            optionsBox.addView(option, withTopMargin(10, dp(56)));
        }
        box.addView(optionsBox, fullWidth());
        card.addView(box, fullWidth());
        return card;
    }

    private BasicCardView speakingQuestionCard() {
        BasicCardView card = new BasicCardView(this);
        LinearLayout box = vertical();
        box.addView(text(t("check/q3_label"), 14, BLUE_DARK, true), fullWidth());
        box.addView(text(tf("check/q3_title", current.symbol, current.words[0].text), 22, cTitle(), true), withTopMargin(8));
        box.addView(text(t("check/q3_hint"), 13, cMuted(), false), withTopMargin(6));

        BasicButton record = new BasicButton(this);
        record.setVariant(isRecording ? BasicButton.VARIANT_DANGER : BasicButton.VARIANT_PRIMARY);
        record.setBasicText(isRecording ? t("btn/stop_record") : t("btn/start_record"));
        record.setOnClickListener(view -> toggleRecording());
        box.addView(record, withTopMargin(16));

        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER);

        BasicButton mine = new BasicButton(this);
        mine.setVariant(BasicButton.VARIANT_DEFAULT);
        mine.setBasicText(t("btn/play_mine"));
        mine.setOnClickListener(view -> playRecording());
        row.addView(mine, new LinearLayout.LayoutParams(0, dp(50), 1f));

        BasicButton correct = new BasicButton(this);
        correct.setVariant(BasicButton.VARIANT_DEFAULT);
        correct.setBasicText(t("btn/play_correct"));
        correct.setOnClickListener(view -> playAsset(current.audioPath, current.symbol));
        LinearLayout.LayoutParams correctParams = new LinearLayout.LayoutParams(0, dp(50), 1f);
        correctParams.setMargins(dp(10), 0, 0, 0);
        row.addView(correct, correctParams);
        box.addView(row, withTopMargin(12));

        card.addView(box, fullWidth());
        return card;
    }

    private void updateOptionSelection(LinearLayout optionsBox, int selectedIndex) {
        for (int i = 0; i < optionsBox.getChildCount(); i++) {
            View child = optionsBox.getChildAt(i);
            child.setBackground(rounded(
                    i == selectedIndex ? cSelectedFill() : cPaper(),
                    i == selectedIndex ? CYAN : cLine(),
                    dp(16),
                    dp(2)
            ));
        }
    }

    private void completeCurrent() {
        completed.add(current.id);
        prefs.edit().putStringSet(KEY_DONE, new HashSet<>(completed)).apply();
        BasicToast.show(this, tf("toast/completed", current.symbol), "success", Toast.LENGTH_SHORT);
        current = firstUnfinished();
        showMap();
    }

    private void handlePrimaryAction() {
        if (screen == Screen.MAP) {
            showLearn();
        } else if (screen == Screen.LEARN) {
            showCheck();
        } else if (screen == Screen.CHECK) {
            if (checkStep == 0) {
                if (selectedListenAnswer != listenCorrectIndex) {
                    BasicToast.show(this, t("toast/answer_first"), "warning", Toast.LENGTH_SHORT);
                    return;
                }
                checkStep = 1;
                showCheckStep();
            } else if (checkStep == 1) {
                if (selectedWordAnswer != wordCorrectIndex) {
                    BasicToast.show(this, t("toast/answer_first"), "warning", Toast.LENGTH_SHORT);
                    return;
                }
                checkStep = 2;
                showCheckStep();
            } else {
                if (!hasRecording) {
                    BasicToast.show(this, t("toast/answer_first"), "warning", Toast.LENGTH_SHORT);
                    return;
                }
                completeCurrent();
            }
        }
    }

    private boolean handleBack() {
        if (screen == Screen.CHECK) {
            if (checkStep > 0) {
                checkStep--;
                showCheckStep();
            } else {
                showLearn();
            }
            return true;
        }
        if (screen == Screen.LEARN) {
            showMap();
            return true;
        }
        if (screen == Screen.SETTINGS_THEME || screen == Screen.SETTINGS_LANGUAGE) {
            showSettings();
            return true;
        }
        if (screen == Screen.SETTINGS) {
            showMap();
            return true;
        }
        return false;
    }

    private void showSettings() {
        screen = Screen.SETTINGS;
        stopRecording(false);
        resetPage(t("page/settings/title"), t("page/settings/subtitle"));
        root.addView(settingsEntryCard(
                t("page/settings/entry_theme"),
                themeLabel(),
                this::showSettingsTheme
        ), withTopMargin(12));
        root.addView(settingsEntryCard(
                t("page/settings/entry_language"),
                languageLabel(),
                this::showSettingsLanguage
        ), withTopMargin(10));
        scrollTop();
    }

    private void showSettingsTheme() {
        screen = Screen.SETTINGS_THEME;
        stopRecording(false);
        resetPage(t("page/settings/theme_page_title"), t("page/settings/theme_page_hint"));
        BasicCardView card = new BasicCardView(this);
        LinearLayout box = vertical();
        for (String key : THEME_KEYS) {
            box.addView(themeOptionRow(key), withTopMargin(8));
        }
        card.addView(box, fullWidth());
        root.addView(card, withTopMargin(12));
        scrollTop();
    }

    private void showSettingsLanguage() {
        screen = Screen.SETTINGS_LANGUAGE;
        stopRecording(false);
        resetPage(t("page/settings/language_page_title"), t("page/settings/language_hint"));
        BasicCardView card = new BasicCardView(this);
        LinearLayout box = vertical();
        for (String code : BasicI18nManager.languages()) {
            box.addView(languageOptionRow(code), withTopMargin(8));
        }
        card.addView(box, fullWidth());
        root.addView(card, withTopMargin(12));
        scrollTop();
    }

    private BasicCardView settingsEntryCard(String title, String value, Runnable onClick) {
        BasicCardView card = new BasicCardView(this);
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setPadding(dp(14), dp(10), dp(14), dp(10));
        row.setMinimumHeight(dp(52));
        LinearLayout textBox = vertical();
        textBox.addView(text(title, 16, cTitle(), true), fullWidth());
        textBox.addView(text(value, 13, cMuted(), false), withTopMargin(2));
        row.addView(textBox, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
        TextView chevron = text("›", 18, cMuted(), true);
        chevron.setIncludeFontPadding(false);
        row.addView(chevron, wrap());
        card.addView(row, fullWidth());
        card.setOnClickListener(view -> onClick.run());
        return card;
    }

    private TextView themeOptionRow(String key) {
        return settingsOptionRow(themeName(key), key.equals(themeKey), () -> {
            if (key.equals(themeKey)) {
                return;
            }
            themeKey = key;
            prefs.edit().putString(KEY_THEME, themeKey).apply();
            recreateApp();
        });
    }

    private TextView languageOptionRow(String code) {
        return settingsOptionRow(t("language/" + code), code.equals(language), () -> {
            if (code.equals(language)) {
                return;
            }
            language = code;
            prefs.edit().putString(KEY_LANGUAGE, language).apply();
            BasicI18nManager.setLanguage(language);
            recreateApp();
        });
    }

    private TextView settingsOptionRow(String label, boolean selected, Runnable onClick) {
        TextView option = text(label, 16, cTitle(), true);
        option.setGravity(Gravity.CENTER_VERTICAL);
        option.setIncludeFontPadding(false);
        option.setPadding(dp(14), dp(10), dp(14), dp(10));
        option.setMinHeight(dp(44));
        option.setBackground(selectableBackground(selected));
        option.setOnClickListener(view -> onClick.run());
        return option;
    }

    private GradientDrawable selectableBackground(boolean selected) {
        return rounded(
                selected ? cSelectedFill() : cPaper(),
                selected ? CYAN : cLine(),
                dp(14),
                dp(2)
        );
    }

    private String themeLabel() {
        return themeName(themeKey);
    }

    private String themeName(String key) {
        return THEME_NIGHT.equals(key) ? t("page/settings/theme_night") : t("page/settings/theme_day");
    }

    private String languageLabel() {
        return t("language/" + language);
    }

    private void scheduleCheckAdvance(Runnable action) {
        mainHandler.removeCallbacks(checkAdvanceRunnable);
        checkAdvanceRunnable = action;
        mainHandler.postDelayed(checkAdvanceRunnable, CHECK_AUTO_ADVANCE_MS);
    }

    private Runnable checkAdvanceRunnable = () -> {};

    private void advanceListenQuestion() {
        if (screen != Screen.CHECK || checkStep != 0 || selectedListenAnswer != listenCorrectIndex) {
            return;
        }
        checkStep = 1;
        selectedWordAnswer = -1;
        showCheckStep();
    }

    private void advanceWordQuestion() {
        if (screen != Screen.CHECK || checkStep != 1) {
            return;
        }
        if (selectedWordAnswer != wordCorrectIndex) {
            return;
        }
        checkStep = 2;
        showCheckStep();
    }

    private void applyThemeBundle() {
        BasicThemeManager.init(this, currentTheme().tokenName);
        colors = BasicThemeManager.colors();
        style = BasicThemeManager.style();
    }

    private String readThemeKey() {
        if (prefs.contains(KEY_LEGACY_NIGHT) && prefs.getBoolean(KEY_LEGACY_NIGHT, false)) {
            prefs.edit().remove(KEY_LEGACY_NIGHT).putString(KEY_THEME, THEME_NIGHT).apply();
            return THEME_NIGHT;
        }
        String saved = prefs.getString(KEY_THEME, THEME_SKY);
        return THEME_NIGHT.equals(saved) ? THEME_NIGHT : THEME_SKY;
    }

    private AppTheme currentTheme() {
        return THEME_NIGHT.equals(themeKey) ? AppTheme.NIGHT : AppTheme.SKY;
    }

    private int cTitle() {
        return colors.textPrimary;
    }

    private int cBody() {
        return colors.textSecondary;
    }

    private int cMuted() {
        return colors.textTertiary;
    }

    private int cPaper() {
        return colors.backgroundSurfaceRaised;
    }

    private int cLine() {
        return colors.borderDefault;
    }

    private int cSelectedFill() {
        return currentTheme().dark ? Color.rgb(30, 58, 82) : Color.rgb(232, 253, 247);
    }

    private int cActiveFill() {
        return currentTheme().dark ? Color.rgb(58, 48, 28) : Color.rgb(255, 247, 215);
    }

    private int cDoneFill() {
        return currentTheme().dark ? Color.rgb(28, 58, 62) : Color.rgb(232, 253, 247);
    }

    private void restoreScreen() {
        switch (screen) {
            case SETTINGS_THEME:
                showSettingsTheme();
                break;
            case SETTINGS_LANGUAGE:
                showSettingsLanguage();
                break;
            case SETTINGS:
                showSettings();
                break;
            case LEARN:
                showLearn();
                break;
            case CHECK:
                showCheckStep();
                break;
            default:
                showMap();
                break;
        }
    }

    private static final class AppTheme {
        static final AppTheme SKY = new AppTheme(THEME_SKY, "sky_planet_day", false);
        static final AppTheme NIGHT = new AppTheme(THEME_NIGHT, "star_planet_night", true);

        final String key;
        final String tokenName;
        final boolean dark;

        AppTheme(String key, String tokenName, boolean dark) {
            this.key = key;
            this.tokenName = tokenName;
            this.dark = dark;
        }
    }

    private void toggleRecording() {
        if (isRecording) {
            stopRecording(true);
            showCheckStep();
            return;
        }
        if (android.os.Build.VERSION.SDK_INT >= 23
                && checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_RECORD_AUDIO);
            return;
        }
        startRecording();
    }

    private void startRecording() {
        releaseActivePlayer();
        releaseRecordingPlayer();
        currentRecordingFile = new File(getCacheDir(), "phonics_record_" + current.id + ".m4a");
        recorder = new MediaRecorder();
        try {
            recorder.setAudioSource(MediaRecorder.AudioSource.MIC);
            recorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
            recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
            recorder.setAudioEncodingBitRate(96000);
            recorder.setAudioSamplingRate(44100);
            recorder.setOutputFile(currentRecordingFile.getAbsolutePath());
            recorder.prepare();
            recorder.start();
            isRecording = true;
            hasRecording = false;
            showCheckStep();
        } catch (RuntimeException | IOException error) {
            Log.e(TAG, "record start failed", error);
            stopRecording(false);
            BasicToast.show(this, t("toast/record_failed"), "warning", Toast.LENGTH_SHORT);
        }
    }

    private void stopRecording(boolean showToast) {
        if (recorder == null) {
            isRecording = false;
            return;
        }
        try {
            recorder.stop();
            hasRecording = currentRecordingFile != null && currentRecordingFile.exists() && currentRecordingFile.length() > 200;
            if (showToast && hasRecording) {
                BasicToast.show(this, t("toast/record_done"), "success", Toast.LENGTH_SHORT);
            }
        } catch (RuntimeException error) {
            Log.e(TAG, "record stop failed", error);
            hasRecording = false;
        } finally {
            recorder.release();
            recorder = null;
            isRecording = false;
        }
    }

    private void playRecording() {
        if (!hasRecording || currentRecordingFile == null || !currentRecordingFile.exists()) {
            BasicToast.show(this, t("toast/no_record"), "warning", Toast.LENGTH_SHORT);
            return;
        }
        releaseActivePlayer();
        releaseRecordingPlayer();
        try {
            recordingPlayer = buildPreparedPlayer(currentRecordingFile);
            recordingPlayer.setOnCompletionListener(mp -> releaseRecordingPlayer());
            recordingPlayer.start();
        } catch (IOException | IllegalStateException error) {
            Log.e(TAG, "play recording failed", error);
            releaseRecordingPlayer();
            BasicToast.show(this, tf("toast/play_failed", t("btn/play_mine")), "warning", Toast.LENGTH_SHORT);
        }
    }

    private void releaseRecordingPlayer() {
        if (recordingPlayer != null) {
            try {
                recordingPlayer.stop();
            } catch (IllegalStateException ignored) {
                // no-op
            }
            recordingPlayer.release();
            recordingPlayer = null;
        }
    }

    private void recreateApp() {
        releaseActivePlayer();
        releaseRecordingPlayer();
        mainHandler.removeCallbacks(checkAdvanceRunnable);
        applyThemeBundle();
        setContentView(createContent());
        configureSystemBars();
        restoreScreen();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_RECORD_AUDIO) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startRecording();
            } else {
                BasicToast.show(this, t("toast/record_permission"), "warning", Toast.LENGTH_SHORT);
            }
        }
    }

    private void playAsset(String path, String label) {
        AudioManager audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);
        if (audioManager != null) {
            if (audioManager.getStreamVolume(AudioManager.STREAM_MUSIC) == 0) {
                BasicToast.show(this, t("toast/volume_zero"), "warning", Toast.LENGTH_SHORT);
                return;
            }
            audioManager.requestAudioFocus(
                    null,
                    AudioManager.STREAM_MUSIC,
                    AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
            );
        }
        try {
            MediaPlayer player = buildPreparedPlayerFromAsset(path);
            startPreparedPlayer(player, path, label);
        } catch (IOException assetError) {
            new Thread(() -> {
                try {
                    File cacheFile = getCachedAudioFile(path);
                    MediaPlayer player = buildPreparedPlayer(cacheFile);
                    mainHandler.post(() -> startPreparedPlayer(player, path, label));
                } catch (IOException error) {
                    Log.e(TAG, "playAsset failed path=" + path, error);
                    mainHandler.post(() -> BasicToast.show(
                            MainActivity.this,
                            tf("toast/play_failed", label),
                            "warning",
                            Toast.LENGTH_SHORT
                    ));
                }
            }, "phonics-audio-play").start();
        }
    }

    private void preloadAudioAsync(String... paths) {
        new Thread(() -> {
            for (String path : paths) {
                try {
                    getCachedAudioFile(path);
                } catch (IOException error) {
                    Log.w(TAG, "preload failed path=" + path, error);
                }
            }
        }, "phonics-audio-preload").start();
    }

    private MediaPlayer buildPreparedPlayer(File cacheFile) throws IOException {
        MediaPlayer player = new MediaPlayer();
        player.setAudioAttributes(new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build());
        player.setDataSource(cacheFile.getAbsolutePath());
        player.setVolume(1f, 1f);
        player.prepare();
        return player;
    }

    private MediaPlayer buildPreparedPlayerFromAsset(String path) throws IOException {
        AssetFileDescriptor descriptor = getAssets().openFd(path);
        try {
            MediaPlayer player = new MediaPlayer();
            player.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build());
            player.setDataSource(
                    descriptor.getFileDescriptor(),
                    descriptor.getStartOffset(),
                    descriptor.getLength()
            );
            player.setVolume(1f, 1f);
            player.prepare();
            return player;
        } finally {
            descriptor.close();
        }
    }

    private void startPreparedPlayer(MediaPlayer player, String path, String label) {
        releaseActivePlayer();
        activePlayer = player;
        activePlayer.setOnCompletionListener(mp -> {
            if (mp == activePlayer) {
                activePlayer = null;
            }
            mp.release();
        });
        activePlayer.setOnErrorListener((mp, what, extra) -> {
            Log.e(TAG, "MediaPlayer error path=" + path + " what=" + what + " extra=" + extra);
            releaseActivePlayer();
            BasicToast.show(this, tf("toast/play_failed", label), "warning", Toast.LENGTH_SHORT);
            return true;
        });
        try {
            activePlayer.start();
            Log.i(TAG, "playing " + path + " durationMs=" + activePlayer.getDuration());
        } catch (IllegalStateException error) {
            Log.e(TAG, "start failed path=" + path, error);
            releaseActivePlayer();
            BasicToast.show(this, tf("toast/play_failed", label), "warning", Toast.LENGTH_SHORT);
        }
    }

    private void releaseActivePlayer() {
        if (activePlayer != null) {
            try {
                activePlayer.stop();
            } catch (IllegalStateException ignored) {
                // no-op
            }
            activePlayer.release();
            activePlayer = null;
        }
    }

    private File getCachedAudioFile(String path) throws IOException {
        File cached = cachedAudioFiles.get(path);
        if (cached != null && cached.exists() && cached.length() > 200) {
            return cached;
        }
        File file = ensureCachedAsset(path);
        cachedAudioFiles.put(path, file);
        return file;
    }

    private File ensureCachedAsset(String path) throws IOException {
        File cacheDir = new File(getCacheDir(), "audio_cache_v2");
        if (!cacheDir.exists() && !cacheDir.mkdirs()) {
            throw new IOException("cannot create cache dir");
        }
        File cacheFile = new File(cacheDir, path.replace('/', '_'));
        if (cacheFile.exists() && cacheFile.length() > 200) {
            return cacheFile;
        }
        try (InputStream input = getAssets().open(path);
             FileOutputStream output = new FileOutputStream(cacheFile, false)) {
            byte[] buffer = new byte[8192];
            int read;
            while ((read = input.read(buffer)) != -1) {
                output.write(buffer, 0, read);
            }
        }
        if (cacheFile.length() <= 200) {
            throw new IOException("asset too small: " + path);
        }
        return cacheFile;
    }

    private Phoneme firstUnfinished() {
        for (Phoneme phoneme : PHONEMES) {
            if (!completed.contains(phoneme.id)) {
                return phoneme;
            }
        }
        return PHONEMES.get(0);
    }

    private float progressRatio() {
        return Math.min(1f, completed.size() / (float) PHONEMES.size());
    }

    private String t(String key) {
        return BasicI18nManager.text(key, key);
    }

    private String tf(String key, Object... args) {
        return String.format(Locale.ROOT, t(key), args);
    }

    private int pageStart() {
        return colors.backgroundPage;
    }

    private int pageEnd() {
        return colors.backgroundPageGradientEnd;
    }

    private void scrollTop() {
        scrollView.post(() -> scrollView.smoothScrollTo(0, 0));
    }

    private LinearLayout vertical() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        return layout;
    }

    private TextView chipLabel(String value, int fill, int textColor) {
        TextView chip = text(value, 12, textColor, true);
        chip.setGravity(Gravity.CENTER);
        chip.setPadding(dp(10), dp(5), dp(10), dp(5));
        chip.setBackground(rounded(fill, Color.TRANSPARENT, dp(999), 0));
        return chip;
    }

    private TextView text(String value, float sp, int color, boolean bold) {
        TextView text = new TextView(this);
        text.setText(value);
        text.setTextColor(color);
        text.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        text.setTypeface(Typeface.DEFAULT, bold ? Typeface.BOLD : Typeface.NORMAL);
        text.setIncludeFontPadding(true);
        return text;
    }

    private GradientDrawable rounded(int fill, int stroke, int radius, int strokeWidth) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(fill);
        drawable.setCornerRadius(radius);
        if (strokeWidth > 0) {
            drawable.setStroke(strokeWidth, stroke);
        }
        return drawable;
    }

    private GradientDrawable gradient(int start, int end, int radius, int orientation) {
        GradientDrawable.Orientation direction = orientation == 2
                ? GradientDrawable.Orientation.TL_BR
                : GradientDrawable.Orientation.TOP_BOTTOM;
        GradientDrawable drawable = new GradientDrawable(direction, new int[]{start, end});
        drawable.setCornerRadius(radius);
        return drawable;
    }

    private LinearLayout.LayoutParams fullWidth() {
        return new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
    }

    private LinearLayout.LayoutParams wrap() {
        return new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
    }

    private LinearLayout.LayoutParams fixed(int width, int height) {
        return new LinearLayout.LayoutParams(width, height);
    }

    private LinearLayout.LayoutParams withTopMargin(int topDp) {
        LinearLayout.LayoutParams params = fullWidth();
        params.setMargins(0, dp(topDp), 0, 0);
        return params;
    }

    private LinearLayout.LayoutParams withTopMargin(int topDp, int heightPx) {
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                heightPx
        );
        params.setMargins(0, dp(topDp), 0, 0);
        return params;
    }

    private int dp(float value) {
        return Math.round(TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP,
                value,
                getResources().getDisplayMetrics()
        ));
    }

    private enum Screen {
        MAP,
        LEARN,
        CHECK,
        SETTINGS,
        SETTINGS_THEME,
        SETTINGS_LANGUAGE
    }

    private static final class PhonemeGroup {
        final String title;
        final List<Phoneme> items;

        PhonemeGroup(String title, List<Phoneme> items) {
            this.title = title;
            this.items = items;
        }
    }

    private static final class Phoneme {
        final String id;
        final String symbol;
        final String groupTitle;
        final String audioPath;
        final String mouthTip;
        final Word[] words;

        Phoneme(String id, String symbol, String groupTitle, String mouthTip, Word[] words) {
            this.id = id;
            this.symbol = symbol;
            this.groupTitle = groupTitle;
            this.mouthTip = mouthTip;
            this.audioPath = "audio/phonemes/" + id + ".mp3";
            this.words = words;
        }
    }

    private static final class Word {
        final String text;
        final String tip;
        final String audioPath;

        Word(String text, String tip) {
            this.text = text;
            this.tip = tip;
            this.audioPath = "audio/words/" + text.toLowerCase() + ".mp3";
        }
    }

    private static Word[] words(String a, String b, String c) {
        return new Word[]{
                new Word(a, a + " 里练目标音"),
                new Word(b, b + " 里再听一次"),
                new Word(c, c + " 放进单词读")
        };
    }

    private static Phoneme p(String id, String symbol, String group, String tip, Word[] words) {
        return new Phoneme(id, symbol, group, tip, words);
    }

    private static final List<PhonemeGroup> GROUPS = new ArrayList<>();
    private static final List<Phoneme> PHONEMES = new ArrayList<>();

    static {
        addGroup("短元音", Arrays.asList(
                p("i_short", "/ɪ/", "短元音", "嘴角轻轻向两边，声音短，不要拖长。", words("sit", "pig", "fish")),
                p("e", "/e/", "短元音", "嘴巴自然咧开，像 pen 中间的短音。", words("pen", "red", "bed")),
                p("ae", "/æ/", "短元音", "嘴巴张大一点，像“啊”和“诶”之间，声音短。", words("cat", "bag", "apple")),
                p("v_short", "/ʌ/", "短元音", "嘴巴自然打开，声音短而有力。", words("cup", "sun", "bus")),
                p("o_short", "/ɒ/", "短元音", "嘴巴圆一点，短促发出。", words("dog", "box", "hot")),
                p("u_short", "/ʊ/", "短元音", "嘴唇微圆，声音短，不要读成长音。", words("book", "good", "look")),
                p("schwa", "/ə/", "短元音", "最轻的弱读音，嘴巴放松。", words("about", "teacher", "sofa"))
        ));
        addGroup("长元音", Arrays.asList(
                p("i_long", "/iː/", "长元音", "嘴角向两边，声音拉长。", words("see", "tree", "green")),
                p("a_long", "/ɑː/", "长元音", "嘴巴打开，声音拉长。", words("car", "star", "park")),
                p("o_long", "/ɔː/", "长元音", "嘴唇圆，声音拉长。", words("ball", "door", "four")),
                p("u_long", "/uː/", "长元音", "嘴唇收圆，声音拉长。", words("blue", "food", "moon")),
                p("er_long", "/ɜː/", "长元音", "舌头放松，发长一点。", words("bird", "girl", "nurse"))
        ));
        addGroup("双元音", Arrays.asList(
                p("ei", "/eɪ/", "双元音", "从 /e/ 滑到 /ɪ/，声音会移动。", words("cake", "name", "rain")),
                p("ai", "/aɪ/", "双元音", "从大口音滑到 /ɪ/。", words("bike", "time", "kite")),
                p("oi", "/ɔɪ/", "双元音", "先圆嘴，再滑到 /ɪ/。", words("boy", "toy", "coin")),
                p("ou", "/əʊ/", "双元音", "从放松音滑到圆嘴。", words("go", "home", "nose")),
                p("au", "/aʊ/", "双元音", "从大口音滑到圆嘴。", words("cow", "house", "mouth")),
                p("ia", "/ɪə/", "双元音", "先短 /ɪ/，再滑到弱音。", words("ear", "near", "dear")),
                p("ea", "/eə/", "双元音", "先 /e/，再放松收尾。", words("air", "chair", "bear")),
                p("ua", "/ʊə/", "双元音", "先短 /ʊ/，再滑到弱音。", words("tour", "poor", "sure"))
        ));
        addGroup("清辅音", Arrays.asList(
                p("p", "/p/", "清辅音", "双唇闭合后轻轻爆破，不震动声带。", words("pen", "pig", "map")),
                p("t", "/t/", "清辅音", "舌尖顶住上齿龈，轻轻弹开。", words("top", "tea", "cat")),
                p("k", "/k/", "清辅音", "舌后部抬起，轻轻送气。", words("key", "kite", "book")),
                p("f", "/f/", "清辅音", "上牙轻碰下唇，送气。", words("fish", "face", "leaf")),
                p("th_clear", "/θ/", "清辅音", "舌尖轻放牙齿之间，送气。", words("three", "think", "mouth")),
                p("s", "/s/", "清辅音", "舌尖靠近上齿龈，像小蛇吐气。", words("sun", "sit", "bus")),
                p("sh", "/ʃ/", "清辅音", "嘴唇稍圆，发 sh 的气音。", words("ship", "she", "fish")),
                p("tsh", "/tʃ/", "清辅音", "像 ch，短促发出。", words("chair", "chicken", "watch")),
                p("h", "/h/", "清辅音", "轻轻哈气，不要太重。", words("hat", "home", "hello"))
        ));
        addGroup("浊辅音", Arrays.asList(
                p("b", "/b/", "浊辅音", "双唇闭合后爆破，声带震动。", words("bag", "boy", "cab")),
                p("d", "/d/", "浊辅音", "舌尖弹开，声带震动。", words("dog", "desk", "red")),
                p("g", "/g/", "浊辅音", "舌后部抬起，声带震动。", words("girl", "go", "bag")),
                p("v", "/v/", "浊辅音", "上牙轻碰下唇，声带震动。", words("van", "very", "five")),
                p("th_voice", "/ð/", "浊辅音", "舌尖轻放牙齿之间，声带震动。", words("this", "that", "mother")),
                p("z", "/z/", "浊辅音", "像 /s/，但声带震动。", words("zoo", "zero", "nose")),
                p("zh", "/ʒ/", "浊辅音", "像 /ʃ/，但声带震动。", words("measure", "vision", "usual")),
                p("dzh", "/dʒ/", "浊辅音", "像 j，短促发出。", words("jam", "job", "orange")),
                p("r", "/r/", "浊辅音", "舌头卷起但不要碰到上颚。", words("red", "rain", "rabbit"))
        ));
        addGroup("其他辅音", Arrays.asList(
                p("m", "/m/", "其他辅音", "双唇闭合，鼻音出来。", words("map", "milk", "home")),
                p("n", "/n/", "其他辅音", "舌尖顶住上齿龈，鼻音出来。", words("name", "nine", "sun")),
                p("ng", "/ŋ/", "其他辅音", "舌后部抬起，鼻音出来。", words("sing", "king", "long")),
                p("l", "/l/", "其他辅音", "舌尖顶住上齿龈，声音从两侧出来。", words("leg", "like", "ball")),
                p("j", "/j/", "其他辅音", "像 yes 开头的轻音。", words("yes", "yellow", "you")),
                p("w", "/w/", "其他辅音", "嘴唇先圆，再放开。", words("we", "water", "window")),
                p("tr", "/tr/", "其他辅音", "先 /t/ 再快速滑到 /r/。", words("tree", "train", "try")),
                p("dr", "/dr/", "其他辅音", "先 /d/ 再快速滑到 /r/。", words("dream", "drive", "dress")),
                p("ts", "/ts/", "其他辅音", "先 /t/ 再接 /s/，短促。", words("cats", "hats", "boats")),
                p("dz", "/dz/", "其他辅音", "先 /d/ 再接 /z/，声带震动。", words("beds", "birds", "cards"))
        ));
    }

    private static void addGroup(String title, List<Phoneme> items) {
        GROUPS.add(new PhonemeGroup(title, items));
        PHONEMES.addAll(items);
    }
}
