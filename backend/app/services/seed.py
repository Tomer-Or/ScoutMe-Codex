from datetime import date, datetime, timedelta, timezone

from sqlmodel import Session, select

from app.auth.security import hash_password
from app.database import engine
from app.models.chat import Conversation, Message
from app.models.comment import Comment
from app.models.endorsement import Endorsement
from app.models.player import Achievement, ClubHistory, HighlightVideo, PlayerProfile, PlayerStats
from app.models.post import Post, PostType
from app.models.user import User, UserRole


DEMO_PASSWORD = "scoutme-demo"

SCOUT_CLUBS = [
    {"name": "Carmel Rising FC", "email": "carmel.rising@scoutme.demo"},
    {"name": "Negev Athletic", "email": "negev.athletic@scoutme.demo"},
    {"name": "Blue Harbor Academy", "email": "blue.harbor@scoutme.demo"},
    {"name": "Galilee Pressing Club", "email": "galilee.pressing@scoutme.demo"},
    {"name": "Metro Lions SC", "email": "metro.lions@scoutme.demo"},
]

PLAYER_SEEDS = [
    {
        "full_name": "Noam Levi",
        "city": "Haifa",
        "country": "Israel",
        "primary_position": "Center Midfielder",
        "secondary_position": "Defensive Midfielder",
        "age": 19,
        "height": 176,
        "weight": 69,
        "dominant_foot": "Right",
        "bio": "Tempo-setting midfielder with sharp first-touch control and strong late-arrival timing into the box.",
        "matches": 31,
        "goals": 6,
        "assists": 11,
        "minutes": 2480,
        "clean_sheets": 0,
        "club_name": "Carmel Juniors",
    },
    {
        "full_name": "Ariel Ben-David",
        "city": "Tel Aviv",
        "country": "Israel",
        "primary_position": "Right Winger",
        "secondary_position": "Left Winger",
        "age": 20,
        "height": 174,
        "weight": 67,
        "dominant_foot": "Left",
        "bio": "Direct dribbler who attacks isolated fullbacks and creates chances early in transition.",
        "matches": 28,
        "goals": 9,
        "assists": 8,
        "minutes": 2235,
        "clean_sheets": 0,
        "club_name": "Tel Aviv South Academy",
    },
    {
        "full_name": "Yotam Shalev",
        "city": "Jerusalem",
        "country": "Israel",
        "primary_position": "Center Back",
        "secondary_position": "Left Back",
        "age": 21,
        "height": 188,
        "weight": 80,
        "dominant_foot": "Right",
        "bio": "Aggressive duel winner with a calm first pass and natural leadership in a back line.",
        "matches": 34,
        "goals": 3,
        "assists": 2,
        "minutes": 3010,
        "clean_sheets": 12,
        "club_name": "Jerusalem Athletic",
    },
    {
        "full_name": "Eitan Mizrahi",
        "city": "Beersheba",
        "country": "Israel",
        "primary_position": "Striker",
        "secondary_position": "Second Striker",
        "age": 18,
        "height": 182,
        "weight": 75,
        "dominant_foot": "Right",
        "bio": "Penalty-box forward with strong near-post movement and relentless pressing from the front.",
        "matches": 26,
        "goals": 14,
        "assists": 4,
        "minutes": 1910,
        "clean_sheets": 0,
        "club_name": "Negev United",
    },
    {
        "full_name": "Roi Azulai",
        "city": "Netanya",
        "country": "Israel",
        "primary_position": "Left Back",
        "secondary_position": "Wing Back",
        "age": 20,
        "height": 178,
        "weight": 71,
        "dominant_foot": "Left",
        "bio": "High-energy fullback who overlaps consistently and delivers low cutbacks with quality.",
        "matches": 30,
        "goals": 2,
        "assists": 9,
        "minutes": 2575,
        "clean_sheets": 7,
        "club_name": "Sharon Waves FC",
    },
    {
        "full_name": "Daniel Sadeh",
        "city": "Rishon LeZion",
        "country": "Israel",
        "primary_position": "Goalkeeper",
        "secondary_position": "Sweeper Keeper",
        "age": 22,
        "height": 191,
        "weight": 84,
        "dominant_foot": "Right",
        "bio": "Commanding goalkeeper with assertive box management and quick restarts into wide areas.",
        "matches": 29,
        "goals": 0,
        "assists": 1,
        "minutes": 2610,
        "clean_sheets": 13,
        "club_name": "Coastal Goalkeeping Academy",
    },
    {
        "full_name": "Lior Harari",
        "city": "Ashdod",
        "country": "Israel",
        "primary_position": "Attacking Midfielder",
        "secondary_position": "Right Winger",
        "age": 19,
        "height": 172,
        "weight": 65,
        "dominant_foot": "Left",
        "bio": "Creative final-third operator who thrives between the lines and combines quickly in tight spaces.",
        "matches": 27,
        "goals": 7,
        "assists": 12,
        "minutes": 2134,
        "clean_sheets": 0,
        "club_name": "Ashdod Mariners",
    },
    {
        "full_name": "Ido Golan",
        "city": "Petah Tikva",
        "country": "Israel",
        "primary_position": "Defensive Midfielder",
        "secondary_position": "Center Back",
        "age": 21,
        "height": 184,
        "weight": 77,
        "dominant_foot": "Right",
        "bio": "Ball-winning six who protects central spaces and plays progressive switches after recoveries.",
        "matches": 33,
        "goals": 2,
        "assists": 5,
        "minutes": 2860,
        "clean_sheets": 0,
        "club_name": "Tikva Union",
    },
    {
        "full_name": "Omri Koren",
        "city": "Nazareth",
        "country": "Israel",
        "primary_position": "Left Winger",
        "secondary_position": "Attacking Midfielder",
        "age": 18,
        "height": 170,
        "weight": 63,
        "dominant_foot": "Right",
        "bio": "Elastic one-v-one winger with a fearless first step and improving end-product in the half-space.",
        "matches": 24,
        "goals": 8,
        "assists": 6,
        "minutes": 1812,
        "clean_sheets": 0,
        "club_name": "Galilee Stars",
    },
    {
        "full_name": "Yuval Mor",
        "city": "Rehovot",
        "country": "Israel",
        "primary_position": "Center Back",
        "secondary_position": "Defensive Midfielder",
        "age": 20,
        "height": 186,
        "weight": 79,
        "dominant_foot": "Left",
        "bio": "Composed left-sided defender who carries into midfield and breaks pressure with diagonal passing.",
        "matches": 31,
        "goals": 1,
        "assists": 3,
        "minutes": 2740,
        "clean_sheets": 10,
        "club_name": "Rehovot City",
    },
    {
        "full_name": "Tal Neria",
        "city": "Kfar Saba",
        "country": "Israel",
        "primary_position": "Right Back",
        "secondary_position": "Right Winger",
        "age": 19,
        "height": 177,
        "weight": 70,
        "dominant_foot": "Right",
        "bio": "Explosive wide defender who covers big ground and recovers quickly after high positioning.",
        "matches": 29,
        "goals": 3,
        "assists": 7,
        "minutes": 2445,
        "clean_sheets": 8,
        "club_name": "Kfar Saba 2007",
    },
    {
        "full_name": "Niv Romano",
        "city": "Bat Yam",
        "country": "Israel",
        "primary_position": "Striker",
        "secondary_position": "Left Winger",
        "age": 21,
        "height": 180,
        "weight": 74,
        "dominant_foot": "Left",
        "bio": "Mobile attacker who bends runs behind the line and finishes calmly from cutback zones.",
        "matches": 32,
        "goals": 13,
        "assists": 5,
        "minutes": 2478,
        "clean_sheets": 0,
        "club_name": "South Coast FC",
    },
    {
        "full_name": "Shai Turgeman",
        "city": "Herzliya",
        "country": "Israel",
        "primary_position": "Center Midfielder",
        "secondary_position": "Attacking Midfielder",
        "age": 18,
        "height": 173,
        "weight": 66,
        "dominant_foot": "Right",
        "bio": "Press-resistant midfielder with clever shoulder checks and a consistent eye for through balls.",
        "matches": 25,
        "goals": 5,
        "assists": 10,
        "minutes": 1984,
        "clean_sheets": 0,
        "club_name": "Herzliya Waves",
    },
    {
        "full_name": "Gal Edri",
        "city": "Afula",
        "country": "Israel",
        "primary_position": "Wing Back",
        "secondary_position": "Left Back",
        "age": 20,
        "height": 179,
        "weight": 72,
        "dominant_foot": "Left",
        "bio": "Relentless wing-back with accurate crossing from deeper channels and strong recovery intensity.",
        "matches": 28,
        "goals": 2,
        "assists": 8,
        "minutes": 2311,
        "clean_sheets": 6,
        "club_name": "Afula North",
    },
    {
        "full_name": "Maor Harel",
        "city": "Modiin",
        "country": "Israel",
        "primary_position": "Goalkeeper",
        "secondary_position": "None",
        "age": 19,
        "height": 189,
        "weight": 82,
        "dominant_foot": "Right",
        "bio": "Shot-stopping goalkeeper with brave close-range reactions and comfort sweeping behind a high line.",
        "matches": 27,
        "goals": 0,
        "assists": 0,
        "minutes": 2430,
        "clean_sheets": 11,
        "club_name": "Modiin Academy",
    },
]

PLAYER_POST_SEEDS = [
    {
        "player": "Noam Levi",
        "title": "Game Summary: Carmel Juniors 2-1 Maccabi North",
        "content": "Strong ninety minutes in midfield today. The highlight clip shows the through ball that led to our second goal and a couple of recoveries in transition.",
    },
    {
        "player": "Ariel Ben-David",
        "title": "Matchday Reflection: Sharp In Wide Isolation",
        "content": "Felt dangerous in one-v-one situations and created three strong chances from the right side. Posting the clip from our best attacking sequence.",
    },
    {
        "player": "Daniel Sadeh",
        "title": "Clean Sheet + Distribution Notes",
        "content": "Happy with the clean sheet and especially with how the back line handled second balls. Added a highlight from one of the quick restarts that broke pressure.",
    },
    {
        "player": "Shai Turgeman",
        "title": "Midfield Summary From This Weekend",
        "content": "Good rhythm on the ball, better tempo control, and more final-third passes than last week. Highlight attached from a move that started with a shoulder check and split pass.",
    },
]

CLUB_POST_SEEDS = [
    {
        "email": "carmel.rising@scoutme.demo",
        "title": "Open Trial Day For U19 Midfielders",
        "content": "Carmel Rising FC is reviewing players for an upcoming trial day focused on central midfielders, attacking fullbacks, and high-work-rate pressers. Submit your ScoutMe profile with recent footage.",
    },
    {
        "email": "blue.harbor@scoutme.demo",
        "title": "Recruiting Wide Defenders And Wingers",
        "content": "Blue Harbor Academy is actively watching left backs, wing backs, and direct wingers with recent match clips and measurable end-product in transition moments.",
    },
    {
        "email": "metro.lions@scoutme.demo",
        "title": "Club Note: Looking For Leaders In The Back Line",
        "content": "Metro Lions SC is scouting center backs and defensive midfielders who communicate well, defend space early, and can carry the ball through the first pressing line.",
    },
]

CHAT_SEEDS = [
    {
        "participants": ["Noam Levi", "carmel.rising@scoutme.demo"],
        "messages": [
            ("carmel.rising@scoutme.demo", "We reviewed your last two midfield clips and liked the tempo control. Are you available to speak this week?"),
            ("Noam Levi", "Absolutely. I can share full-match footage from the last three league games as well."),
            ("carmel.rising@scoutme.demo", "Perfect. Send the full-match links when ready, and we will line up a short intro call."),
        ],
    },
    {
        "participants": ["Ariel Ben-David", "blue.harbor@scoutme.demo"],
        "messages": [
            ("blue.harbor@scoutme.demo", "Your one-v-one actions from the right side stood out. We are currently tracking wide players for a summer intake."),
            ("Ariel Ben-David", "Thanks. I just posted a new game summary and can send another highlight package focused on final-third decisions."),
        ],
    },
    {
        "participants": ["Daniel Sadeh", "metro.lions@scoutme.demo"],
        "messages": [
            ("metro.lions@scoutme.demo", "Strong box command in the recent clips. We would like a longer look at your distribution and starting positions."),
            ("Daniel Sadeh", "I have two full matches with a higher defensive line. Happy to send both."),
            ("metro.lions@scoutme.demo", "That would be ideal. We are especially interested in how you manage space behind the back line."),
        ],
    },
    {
        "participants": ["Shai Turgeman", "negev.athletic@scoutme.demo"],
        "messages": [
            ("negev.athletic@scoutme.demo", "We liked the way you scanned before receiving in midfield. Are you open to a trial invitation later this month?"),
            ("Shai Turgeman", "Yes, definitely. I can also share more recent clips from matches against stronger pressing teams."),
        ],
    },
]


def slugify(value: str) -> str:
    return value.lower().replace(" ", "-")


def player_avatar_path(name: str) -> str:
    return f"/avatars/players/{slugify(name)}.png"


def club_avatar_path(name: str) -> str:
    return f"/avatars/clubs/{slugify(name)}.svg"


def normalize_conversation_pair(user_a_id: int, user_b_id: int) -> tuple[int, int]:
    return tuple(sorted((user_a_id, user_b_id)))


def seed_posts(session: Session, player_profiles: list[PlayerProfile], scout_users: list[User]) -> None:
    existing_post = session.exec(select(Post).limit(1)).first()
    if existing_post:
        return

    profile_by_name = {profile.full_name: profile for profile in player_profiles}
    scout_by_email = {scout.email: scout for scout in scout_users}

    for seed in PLAYER_POST_SEEDS:
        profile = profile_by_name.get(seed["player"])
        if not profile:
            continue
        highlight = session.exec(
            select(HighlightVideo).where(HighlightVideo.player_profile_id == profile.id).order_by(HighlightVideo.created_at.desc())
        ).first()
        session.add(
            Post(
                user_id=profile.user_id,
                player_profile_id=profile.id,
                highlight_video_id=highlight.id if highlight else None,
                title=seed["title"],
                content=seed["content"],
                post_type=PostType.player_update,
            )
        )

    for seed in CLUB_POST_SEEDS:
        scout = scout_by_email.get(seed["email"])
        if not scout:
            continue
        session.add(
            Post(
                user_id=scout.id,
                player_profile_id=None,
                highlight_video_id=None,
                title=seed["title"],
                content=seed["content"],
                post_type=PostType.club_announcement,
            )
        )

    session.commit()


def seed_chats(session: Session, player_profiles: list[PlayerProfile], scout_users: list[User]) -> None:
    existing_message = session.exec(select(Message).limit(1)).first()
    if existing_message:
        return

    user_by_key = {profile.full_name: session.get(User, profile.user_id) for profile in player_profiles}
    user_by_key.update({scout.email: scout for scout in scout_users})
    base_time = datetime.now(timezone.utc) - timedelta(days=2)

    for conversation_offset, seed in enumerate(CHAT_SEEDS):
        first_user = user_by_key.get(seed["participants"][0])
        second_user = user_by_key.get(seed["participants"][1])
        if not first_user or not second_user:
            continue
        participant_one_id, participant_two_id = normalize_conversation_pair(first_user.id, second_user.id)
        conversation = Conversation(
            participant_one_id=participant_one_id,
            participant_two_id=participant_two_id,
            created_at=base_time + timedelta(hours=conversation_offset * 7),
            updated_at=base_time + timedelta(hours=conversation_offset * 7),
        )
        session.add(conversation)
        session.commit()
        session.refresh(conversation)

        for message_offset, (sender_key, content) in enumerate(seed["messages"]):
            sender = user_by_key.get(sender_key)
            if not sender:
                continue
            created_at = base_time + timedelta(hours=conversation_offset * 7, minutes=message_offset * 18)
            session.add(
                Message(
                    conversation_id=conversation.id,
                    sender_user_id=sender.id,
                    content=content,
                    created_at=created_at,
                )
            )
            conversation.updated_at = created_at
            session.add(conversation)

        session.commit()


def seed_database() -> None:
    with Session(engine) as session:
        existing_demo = session.exec(select(User).where(User.email.endswith("@scoutme.demo"))).first()
        if existing_demo:
            demo_profiles = session.exec(
                select(PlayerProfile).join(User).where(User.email.endswith("@scoutme.demo"))
            ).all()
            scout_users = session.exec(
                select(User).where(User.role == UserRole.scout, User.email.endswith("@scoutme.demo"))
            ).all()
            for profile in demo_profiles:
                profile.profile_image_url = player_avatar_path(profile.full_name)
                session.add(profile)
            session.commit()
            seed_posts(session, demo_profiles, scout_users)
            seed_chats(session, demo_profiles, scout_users)
            return

        scout_users: list[User] = []
        for club in SCOUT_CLUBS:
            scout = User(
                email=club["email"],
                password_hash=hash_password(DEMO_PASSWORD),
                role=UserRole.scout,
            )
            session.add(scout)
            scout_users.append(scout)

        session.commit()
        for scout in scout_users:
            session.refresh(scout)

        player_profiles: list[PlayerProfile] = []
        for index, player in enumerate(PLAYER_SEEDS, start=1):
            email_name = player["full_name"].lower().replace(" ", ".")
            user = User(
                email=f"{email_name}@scoutme.demo",
                password_hash=hash_password(DEMO_PASSWORD),
                role=UserRole.player,
            )
            session.add(user)
            session.commit()
            session.refresh(user)

            profile = PlayerProfile(
                user_id=user.id,
                full_name=player["full_name"],
                phone=f"+972-50-100-{index:04d}",
                city=player["city"],
                country=player["country"],
                profile_image_url=player_avatar_path(player["full_name"]),
                primary_position=player["primary_position"],
                secondary_position=player["secondary_position"],
                age=player["age"],
                height=player["height"],
                weight=player["weight"],
                dominant_foot=player["dominant_foot"],
                bio=player["bio"],
            )
            session.add(profile)
            session.commit()
            session.refresh(profile)
            player_profiles.append(profile)

            session.add(
                PlayerStats(
                    player_profile_id=profile.id,
                    matches_played=player["matches"],
                    goals=player["goals"],
                    assists=player["assists"],
                    minutes_played=player["minutes"],
                    clean_sheets=player["clean_sheets"],
                    custom_notes="Demo profile seeded for portfolio exploration.",
                )
            )
            session.add(
                ClubHistory(
                    player_profile_id=profile.id,
                    club_name=player["club_name"],
                    start_date=date(2023, 8, 1),
                    end_date=None,
                    position=player["primary_position"],
                    notes="Current club environment focused on video review and weekly match exposure.",
                )
            )
            session.add(
                Achievement(
                    player_profile_id=profile.id,
                    title="Regional Showcase Selection",
                    year=2025,
                    description="Selected for a regional all-star showcase event after consistent league performances.",
                )
            )
            session.add(
                HighlightVideo(
                    player_profile_id=profile.id,
                    title=f"{player['full_name']} 2025 Highlights",
                    description="Seeded demo highlight reel.",
                    video_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    thumbnail_url=None,
                )
            )

        session.commit()

        for index, profile in enumerate(player_profiles):
            scout = scout_users[index % len(scout_users)]
            session.add(
                Comment(
                    player_profile_id=profile.id,
                    author_user_id=scout.id,
                    content=f"{SCOUT_CLUBS[index % len(SCOUT_CLUBS)]['name']} likes the positional discipline and recent output here.",
                )
            )
            session.add(
                Endorsement(
                    player_profile_id=profile.id,
                    user_id=scout.id,
                )
            )

        session.commit()
        seed_posts(session, player_profiles, scout_users)
        seed_chats(session, player_profiles, scout_users)
