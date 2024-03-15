
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import (Fragment, Memory)
from api.serializers import (CleanMemorySerializer,FragmentSerializer,
                          MemoryCreateSerializer, MemorySerializer)

from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response

class FragmentView(generics.ListCreateAPIView):
    queryset = Fragment.objects.all()
    serializer_class = FragmentSerializer


class MemoryView(generics.ListCreateAPIView):
    queryset = Memory.objects.all()
    serializer_class = MemorySerializer


class FetchMemoryView(APIView):
    # queryset = Entry.objects.all()
    serializer_class = MemorySerializer

    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = self.request.query_params.get('code')
        if code is None:
            code = 0

        # TODO: DNE check
        memory = Memory.objects.get(code=code)
        # data = {
        #     "code": code,
        #     "fragment": FragmentSerializer(Memory.objects.get(code=code).fragments.all(), many=True).data
        # }

        return Response(MemorySerializer(memory).data, status=status.HTTP_200_OK)

        # return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class CreateMemoryView(APIView):

    serializer_class = MemoryCreateSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        print(request.data)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            fragments = serializer.data.get('fragments')
            if 'code' in request.data.keys():
                code = request.data['code']
                # This is for updating the Memories. it shouldn't be used by the frontend.
                memory = Memory.objects.get(code=code)
                memory.fragments.clear()
                for frag in fragments:
                    # TODO: make this atomic
                    fragment, created = Fragment.objects.get_or_create(
                        pinyin=frag['pinyin'],
                        cchar=frag['cchar'])
                    memory.f.add(fragment)
                memory.save()
                return Response(MemorySerializer(memory).data, status=status.HTTP_200_OK)
            else:
                latest = Memory.objects.order_by('-code').first()
                code = 0
                if latest is not None:
                    code = latest.code + 1

                memory = Memory(code=code)
                memory.save()
                for frag in fragments:
                    fragment, created = Fragment.objects.get_or_create(
                        pinyin=frag['pinyin'],
                        cchar=frag['cchar'])
                    memory.fragments.add(fragment)
                memory.save()

            # memory.fragments.add(*fragments)

            return Response(MemorySerializer(memory).data, status=status.HTTP_201_CREATED)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class DestroyMemoryView(generics.RetrieveDestroyAPIView):
    queryset = Memory.objects.all()
    serializer_class = MemorySerializer
    lookup_field = "code"


class CleanMemoryView(APIView):

    serializer_class = CleanMemorySerializer

    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        print(request.data)

        memoryCodes = Memory.objects.values_list("code", flat=True)
        countCodes = memoryCodes.count()
        # return Response({"OK": "counted and list current memory codes", "count": count, "data": memory}, status=status.HTTP_200_OK)

        # memory = Memory.objects.filter(code__in=codes)
        memoryEmpty = Memory.objects.filter(fragments=None).exclude(
            code=0).values_list("code", flat=True)
        countEmpty = memoryEmpty.count()
        # memory.delete()
        return Response({
            "OK": "Previewing memory status - Send POST to clean",
            "empty memories": {
                "count": countEmpty,
                "codes": memoryEmpty
            },
            "total": {
                "count": countCodes,
                "codes": memoryCodes
            }
        }, status=status.HTTP_200_OK)

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        print(request.data)

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            codes = serializer.data.get('codes')
            memory = Memory.objects.filter(code__in=codes)
            count = memory.count()
            memory.delete()
            return Response({"OK": "Successfully cleaned up memories",
                             "memories recycled": count}, status=status.HTTP_200_OK)

        # memory = Memory.objects.filter(code__in=codes)
        memory = Memory.objects.filter(fragments=None).exclude(code=0)
        count = memory.count()
        memory.delete()
        return Response({"OK": "Successfully cleaned up empty memories", "count": count}, status=status.HTTP_200_OK)

    # NOTE: this isn't proper convention... but it's here just to help debug
    # def delete(self, request, format=None):
    #     if not self.request.session.exists(self.request.session.session_key):
    #         self.request.session.create()
    #     # codes = [17, 18, 19, 20, 21, 22, 23, 24, 25,
    #     #          26, 27, 28, 29, 30, 31, 32, 33, 34, 35]
    #     codes = []
    #     if codes:
    #         memory = Memory.objects.filter(code__in=codes)
    #         memory.delete()
    #         return Response({"OK": "cleaned up specified memories", "data": MemorySerializer(memory, many=True).data}, status=status.HTTP_200_OK)

    #     memory = Memory.objects.filter(fragments=None).exclude(code=0)
    #     memory.delete()
    #     return Response({"OK": "cleaned up empty memories", "data": MemorySerializer(memory, many=True).data}, status=status.HTTP_200_OK)
