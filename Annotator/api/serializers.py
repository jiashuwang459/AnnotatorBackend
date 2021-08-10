from django.db.models.fields import CharField, IntegerField
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.fields import JSONField
from .models import BlacklistEntry, ChineseEntry, Entry, Memory, Fragment
from .utils import isChinese


class EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = ('id', 'owner', 'traditional',
                  'simplified', 'pinyin', 'english', 'priority')


class CreateEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = ('owner', 'traditional', 'simplified',
                  'pinyin', 'english', 'priority')


class UpdateEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = ('owner', 'traditional', 'simplified',
                  'pinyin', 'english', 'priority')


class ReloadEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = ('owner',)


class LookupEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = ('traditional', 'simplified', 'pinyin', 'english')


class BlacklistEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlacklistEntry
        fields = ('owner', 'traditional', 'simplified',
                  'pinyin', 'english', 'reason')


class FragmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fragment
        fields = ('pinyin', 'cchar')

    def create(self, validated_data):
        print("JIASHU2")
        print(validated_data)
        validated_data
        pinyin = validated_data.pop('pinyin')
        cchar = validated_data.pop('cchar')

        fragment = Fragment.objects.filter(pinyin=pinyin, cchar=cchar)
        if fragment.exists():
            return fragment.first()
        else:
            return Fragment.objects.create(**validated_data)
        # memory.objects.fragments.set(fragments)
        # return frag


class MemorySerializer(serializers.ModelSerializer):
    fragments = FragmentSerializer(many=True, read_only=False)

    class Meta:
        model = Memory
        fields = ('code', 'fragments',)
        depth = 2


class CleanMemorySerializer(serializers.Serializer):
    codes = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=True
    )


class MemoryCreateSerializer(serializers.ModelSerializer):
    fragments = FragmentSerializer(many=True, read_only=False)

    class Meta:
        model = Memory
        fields = ('fragments',)
        depth = 2

    def create(self, validated_data):
        fragments = validated_data.pop('fragments')
        print("JIASHU")
        print(validated_data)
        memory = Memory.objects.create(**validated_data)
        for fragData in fragments:
            Fragment.objects.create(**fragData)
        # memory.objects.fragments.set(fragments)
        return memory

    def update(self, instance, validated_data):
        fragments_data = validated_data.pop('fragments')
        fragments = (instance.fragments).all()
        fragments = list(fragments)
        instance.code = validated_data.get('code', instance.code)
        instance.save()

        for fragData in fragments_data:
            Fragment.objects.create(**fragData)
        return instance


class AnnotationSerializer(serializers.Serializer):
    text = serializers.CharField(allow_blank=True, trim_whitespace=False)


# class ChineseEntryField(serializers.Field):
#     default_error_messages = {
#         'incorrect_type': 'Incorrect type. Expected a string, but got {input_type}',
#         'incorrect_format': 'Incorrect format. Expected `ce(?,?)`.',
#         'not_single_char': 'cchar was not a single char',
#         'not_chinese_char': "cchar wasn't a chinese character",
#     }

#     def to_representation(self, value):
#         return "ce(%s, %s)" % (value.pinyin, value.cchar)

#     def to_internal_value(self, data):
#         if not isinstance(data, str):
#             self.fail('incorrect_type', input_type=type(data).__name__)

#         if not re.match(r"^ce\(.*,.*\)$", data):
#             self.fail('incorrect_format')

#         data = data.strip('ce(').rstrip(')')
#         pinyin, cchar = [col for col in data.split(',')]

#         if len(cchar) > 1:
#             self.fail('not_single_char')

#         if not isChinese(cchar):
#             self.fail('not_chinese_char')

#         return ChineseEntry(pinyin, cchar)


# class ChineseEntrySerializer(serializers.Serializer):
#     annotations = serializers.ListField(
#         child=JSONField()
#     )

class ChineseEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Fragment
        fields = ('pinyin', 'cchar')


class PhraseEntrySerializer(serializers.Serializer):
    cchars = ChineseEntrySerializer(many=True, read_only=True)
    english = serializers.CharField()


# class CreateMemorySerializer(serializers.Serializer):
#     memory : serializers.ListField(
#         child=Memory
#     )
#     class Meta:
#         model = Memory
#         fields = ('id', 'code', 'pinyin', 'cchar')

    # class Meta:
    #     model = Entry
    #     fields = ('traditional', 'simplified', 'pinyin', 'english')
